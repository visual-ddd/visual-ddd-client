import { action, makeObservable, observable } from 'mobx';
import { captureException, addBreadcrumb } from '@sentry/nextjs';
import { v4 } from 'uuid';
import { Disposer, NoopArray } from '@wakeapp/utils';
import { IDestroyable, IDisposable, TimeoutError, tryDispose } from '@/lib/utils';
import { command, derive, effect, makeAutoBindThis, mutation } from '@/lib/store';
import { OpenAIEventSourceModel, isAbort } from '@/lib/openai-event-source';
import findLastIndex from 'lodash/findLastIndex';

import { ChatContext, ExtensionType, GLOBAL_EXTENSION_KEY, IBot, Role } from './protocol';
import type { Extension, Message } from './protocol';
import { registry } from './registry';
import { BotEvent } from './BotEvent';
import { extraMention } from './util';
import { BotPersister } from './BotPersister';
import type { BotStorage } from './BotPersister';
import { MAX_CONTEXT_PROMPT_LENGTH, MAX_CONTEXT_MESSAGE } from './constants';
import { calculateContext } from './chat-context';
import { getTokenCount } from './tokenizer';
import { BotMeta } from './types';

export interface BotModelOptions {
  uuid: string;
  metaInfo: BotMeta;
}

/**
 * 机器人
 */
export class BotModel implements IDisposable, IBot, IDestroyable {
  /**
   * 事件
   */
  readonly event = new BotEvent();

  private persister: BotPersister;
  /**
   * 待回收资源
   */
  private pending: Map<string, Function> = new Map();

  @observable
  history: Message[] = [];

  /**
   * 输入框
   */
  @observable
  prompt: string = '';

  @derive
  get defaultExtension() {
    return this.availableExtensions.find(i => i.key === GLOBAL_EXTENSION_KEY)!;
  }

  @derive
  get activeExtension(): Extension {
    const matchKey = extraMention(this.prompt);

    if (matchKey) {
      const ext = this.availableExtensions.find(i => i.match === matchKey);
      if (ext) {
        return ext;
      }
    }

    return this.defaultExtension;
  }

  /**
   * 可以使用的扩展
   */
  @observable.shallow
  availableExtensions: Extension[] = [];

  @derive
  get availableExtensionsExceptGlobal() {
    return this.availableExtensions.filter(i => i.key !== GLOBAL_EXTENSION_KEY);
  }

  /**
   * 正在处理的消息
   */
  @derive
  get pendingHistory() {
    return this.history.filter(i => i.pending);
  }

  get uuid() {
    return this.options.uuid;
  }

  private disposer = new Disposer();
  private options: BotModelOptions;

  constructor(options: BotModelOptions) {
    this.options = options;

    makeObservable(this);
    makeAutoBindThis(this);

    this.setAvailableExtensions();

    if (this.activeExtension == null) {
      throw new Error('Global extension not found');
    }

    this.persister = new BotPersister({ uuid: this.options.uuid, event: this.event, onLoad: this.loadHistory });

    this.disposer.push(
      () => tryDispose(this.persister),
      () => {
        this.clearPendingTask();
      },
      registry.subscribe(() => {
        this.setAvailableExtensions();
      })
    );

    // 预热 encode, 这个需要加载较多的数据
    setTimeout(() => {
      this.countToken('');
    }, 4000);
  }

  dispose() {
    this.disposer.release();
  }

  destroy(): void {
    this.persister.destroy();
  }

  @action
  setPrompt = (value: string) => {
    this.prompt = value;
  };

  getSystemPrompt(): string | undefined {
    return this.options.metaInfo.system;
  }

  getTemperature() {
    return this.options.metaInfo.temperature;
  }

  /**
   * 最大历史消息数
   * @returns
   */
  getMaxContextLength() {
    return this.options.metaInfo.maxContextLength || MAX_CONTEXT_MESSAGE;
  }

  /**
   * 获取插件
   */
  getExtension(key: string): Extension | undefined {
    return this.availableExtensions.find(i => i.key === key);
  }

  /**
   * 提交 prompt
   */
  @effect('COMMIT')
  async commit() {
    if (!this.prompt.trim()) {
      return;
    }

    const message = this.getNormalizedPrompt();
    const token = await this.countToken(message);
    const extension = this.activeExtension;

    if (token > MAX_CONTEXT_PROMPT_LENGTH) {
      throw new Error('文本长度过长，请裁剪后发送');
    }

    try {
      const response = extension.onSend({ message, bot: this, currentTarget: extension });
      const responseMessageId = v4();
      this.pending.set(responseMessageId, response.dispose);

      if (extension.type === ExtensionType.Message) {
        // 消息回复
        this.addMessage({
          uuid: v4(),
          role: Role.User,
          content: message,
          timestamp: Date.now(),
          extension: extension.key,
          token,
        });

        this.addMessage({
          uuid: responseMessageId,
          role: Role.Assistant,
          content: '',
          timestamp: Date.now(),
          pending: {
            extension,
            response,
          },
          extension: extension.key,
        });
      } else {
        // 指令执行
        this.addMessage({
          uuid: responseMessageId,
          role: Role.User,
          content: message,
          timestamp: Date.now(),
          extension: extension.key,
          token,
          pending: {
            extension,
            response,
          },
        });
      }

      const resMsg = this.getMessageById(responseMessageId)!;

      // 保留话题
      if (extension !== this.defaultExtension && extension.keepMatch) {
        this.setPrompt(`#${extension.match} `);
      } else {
        this.setPrompt('');
      }

      try {
        await response.result;
        if (extension.type === ExtensionType.Message) {
          this.updateMessageContent(responseMessageId, response.eventSource.result);
        }
      } catch (err) {
        console.error(`[BotModel] commit error: `, err);

        if (isAbort(err)) {
          if (extension.type === ExtensionType.Message) {
            this.updateMessageContent(responseMessageId, response.eventSource.result);
          }

          return;
        }

        // 回复错误信息
        const errorMessage = `❌ 抱歉，出现了错误: ${
          TimeoutError.isTimeoutError(err) ? '请求超时' : (err as Error).message
        }`;
        this.captureException(err as Error, resMsg, response.eventSource);

        if (extension.type === ExtensionType.Message) {
          // 追加错误信息
          this.updateMessageContent(
            responseMessageId,
            response.eventSource.result ? response.eventSource.result + '\n' + errorMessage : errorMessage
          );
        } else {
          this.responseMessage(errorMessage, extension);
        }
      } finally {
        this.resetMessagePending(responseMessageId);
        this.event.emit('MESSAGE_FINISHED', { message: resMsg });
      }
    } catch (err) {
      console.error(err);
      captureException(err);
      this.responseMessage(`抱歉，出现了错误：${(err as Error).message}`);
    }
  }

  @effect('STOP')
  async stop(id: string) {
    this.resetMessagePending(id);
  }

  @mutation('REMOVE_MESSAGE', false)
  removeMessage(id: string) {
    this.resetMessagePending(id);
    const index = this.history.findIndex(i => i.uuid === id);

    if (index > -1) {
      const [message] = this.history.splice(index, 1);
      this.event.emit('MESSAGE_REMOVED', { message });
    }
  }

  /**
   * 新增回复信息
   * @param message
   * @param extension
   */
  @command('ADD_MESSAGE')
  responseMessage(message: string, extension?: Extension) {
    const msg: Message = {
      uuid: v4(),
      role: Role.Assistant,
      content: message,
      timestamp: Date.now(),
      extension: (extension && this.activeExtension)?.key,
    };

    Promise.resolve().then(() => {
      this.addMessage(msg);
    });

    const update = async (newValue: string | ((currentValue: string) => string)) => {
      await Promise.resolve();
      const currentMsg = this.getMessageById(msg.uuid);
      if (currentMsg != null) {
        const newContent = typeof newValue === 'function' ? newValue(currentMsg.content) : newValue;
        this.updateMessageContent(msg.uuid, newContent);
      }
    };

    return update;
  }

  /**
   * 激活
   */
  @command('ACTIVE')
  active() {
    requestAnimationFrame(() => {
      this.event.emit('ACTIVE');
    });
  }

  getMessageById(id: string) {
    return this.history.find(i => i.uuid === id);
  }

  /**
   * 获取上下文信息
   */
  getChatContext(prompt: string): Promise<ChatContext> {
    // 拷贝一下，避免 history 后面修改了
    const maxContextLength = this.getMaxContextLength();
    return calculateContext(prompt, this.history.slice(-(maxContextLength * 2)), {
      maxContextLength,
    });
  }

  /**
   * 获取待总结的消息
   * @param target
   * @returns
   */
  async getMessagesToSummary(target: Message): Promise<Message[]> {
    const index = this.history.findIndex(i => i.uuid === target.uuid);
    if (index === -1) {
      return NoopArray;
    }

    const { messages } = await calculateContext('', this.history.slice(0, index + 1));

    return messages;
  }

  /**
   * 计算 Token 数量
   * @param message
   * @returns
   */
  countToken(message: string): Promise<number> {
    return getTokenCount(message);
  }

  @mutation('UPDATE_SUMMARY', false)
  updateSummary(messageId: string, summary: string): void {
    const message = this.getMessageById(messageId);
    if (message) {
      message.summary = summary;
      this.event.emit('MESSAGE_UPDATED', { message });
    }
  }

  /**
   * 清理消息
   */
  @mutation('CLEAR_HISTORY', false)
  clearHistory(): void {
    this.history = [];
    this.clearPendingTask();

    this.event.emit('HISTORY_CLEARED');
  }

  @command('SELECT_PREVIOUS_MESSAGE')
  selectPreviousMessage(): string | undefined {
    if (this.prompt.length) {
      return;
    }

    const idx = findLastIndex(this.history, i => {
      return !!(i.role === Role.User);
    });

    if (idx !== -1) {
      const message = this.history[idx];
      const content = `${
        message.extension && message.extension !== GLOBAL_EXTENSION_KEY ? `#${message.extension} ` : ''
      }${message.content}`;
      this.setPrompt(content);

      return content;
    }
  }

  /**
   * 设置可用的插件
   */
  @action
  private setAvailableExtensions() {
    this.availableExtensions = Array.from(registry.registered().values());
  }

  @mutation('ADD_MESSAGE', false)
  private addMessage(message: Message) {
    this.history.push(message);
    this.event.emit('MESSAGE_ADDED', { message: this.history[this.history.length - 1] });
  }

  @mutation('LOAD_HISTORY', false)
  private loadHistory(storage: BotStorage) {
    this.history = storage.history;

    this.event.emit('HISTORY_LOADED');
  }

  @action
  private updateMessageContent(id: string, content: string) {
    const message = this.history.find(i => i.uuid === id);
    if (message) {
      message.content = content;
      this.event.emit('MESSAGE_UPDATED', { message });
    }
  }

  @action
  private resetMessagePending(id: string) {
    const message = this.history.find(i => i.uuid === id && i.pending);

    if (message) {
      // 回收
      const pending = this.pending.get(id);
      if (pending) {
        this.pending.delete(id);
        pending();
      }

      message.pending = undefined;

      this.event.emit('MESSAGE_UPDATED', { message });
    }
  }

  private getNormalizedPrompt() {
    const value = this.prompt.trim();
    if (this.activeExtension !== this.defaultExtension) {
      return value.slice(`#${this.activeExtension.match}`.length).trim();
    }

    return value;
  }

  private clearPendingTask() {
    const pendingTasks = Array.from(this.pending.values());
    this.pending.clear();
    pendingTasks.forEach(i => i());
  }

  private captureException(err: Error, message: Message, source: OpenAIEventSourceModel) {
    addBreadcrumb({
      category: 'openai-ask',
      message: message.content,
      level: 'info',
    });
    addBreadcrumb({
      category: 'openai-response',
      message: source.result,
      level: 'info',
    });

    captureException(err);
  }
}
