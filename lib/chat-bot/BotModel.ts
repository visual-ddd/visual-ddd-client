import { action, makeObservable, observable } from 'mobx';
import { captureException, addBreadcrumb } from '@sentry/nextjs';
import { v4 } from 'uuid';
import { Disposer, NoopArray } from '@wakeapp/utils';
import { IDisposable, TimeoutError, tryDispose } from '@/lib/utils';
import { command, derive, effect, makeAutoBindThis, mutation } from '@/lib/store';
import type { OpenAIEventSourceModel } from '@/lib/openai-event-source';

import { ChatContext, ExtensionType, GLOBAL_EXTENSION_KEY, IBot, Role } from './protocol';
import type { Extension, Message } from './protocol';
import { registry } from './registry';
import { BotEvent } from './BotEvent';
import { BotKeyBinding } from './BotKeyBinding';
import { extraMention } from './util';
import { BotPersister } from './BotPersister';
import type { BotStorage } from './BotPersister';
import { DEFAULT_WINDOW_SIZE, MAX_CONTEXT_PROMPT_LENGTH, MAX_CONTEXT_MESSAGE } from './constants';
import { calculateContext } from './chat-context';
import { getTokenCount } from './tokenizer';

/**
 * 机器人
 */
export class BotModel implements IDisposable, IBot {
  /**
   * 事件
   */
  readonly event = new BotEvent();

  readonly keybinding: BotKeyBinding;
  private persister: BotPersister;
  /**
   * 待回收资源
   */
  private pending: Map<string, Function> = new Map();

  @observable
  size: number = DEFAULT_WINDOW_SIZE;

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

  private disposer = new Disposer();

  constructor() {
    makeObservable(this);
    makeAutoBindThis(this);

    this.setAvailableExtensions();

    if (this.activeExtension == null) {
      throw new Error('Global extension not found');
    }

    this.keybinding = new BotKeyBinding({ bot: this });
    this.persister = new BotPersister({ event: this.event, onLoad: this.loadHistory });

    this.disposer.push(
      () => tryDispose(this.keybinding),
      () => tryDispose(this.persister),
      () => {
        this.clearPendingTask();
      },
      registry.subscribe(() => {
        this.setAvailableExtensions();
      })
    );

    // @ts-expect-error
    globalThis.__BOT__ = this;
  }

  dispose() {
    this.disposer.release();
  }

  @action
  setPrompt = (value: string) => {
    this.prompt = value;
  };

  @command('SHOW')
  show() {
    this.event.emit('SHOW');
  }

  @mutation('SET_SIZE', false)
  setSize(size: number) {
    this.size = size;
    this.event.emit('SIZE_CHANGE', { size });
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
      if (extension !== this.defaultExtension) {
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

        if (err instanceof DOMException && err.name === 'AbortError') {
          // 用户终止了
          return;
        }

        // 回复错误信息
        const errorMessage = `❌ 抱歉，出现了错误: ${
          TimeoutError.isTimeoutError(err) ? '请求超时' : (err as Error).message
        }`;
        this.captureException(err as Error, resMsg, response.eventSource);

        if (extension.type === ExtensionType.Message) {
          this.updateMessageContent(responseMessageId, errorMessage);
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
  responseMessage(message: string, extension?: Extension): void {
    Promise.resolve().then(() => {
      this.addMessage({
        uuid: v4(),
        role: Role.Assistant,
        content: message,
        timestamp: Date.now(),
        extension: (extension && this.activeExtension)?.key,
      });
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
    return calculateContext(prompt, this.history.slice(-(MAX_CONTEXT_MESSAGE * 2)));
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
    this.size = storage.size;
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
      return value.slice(`#${this.activeExtension.match}`.length);
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
