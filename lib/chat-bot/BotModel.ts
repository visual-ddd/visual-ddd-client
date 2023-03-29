import { action, makeObservable, observable } from 'mobx';
import { captureException } from '@sentry/nextjs';
import { v4 } from 'uuid';
import { Disposer } from '@wakeapp/utils';
import { IDisposable, tryDispose } from '@/lib/utils';
import { command, derive, makeAutoBindThis, mutation } from '@/lib/store';
import findLastIndex from 'lodash/findLastIndex';

import { ExtensionType, GLOBAL_EXTENSION_KEY, IBot, Role } from './protocol';
import type { Extension, Message } from './protocol';
import { registry } from './registry';
import { BotEvent } from './BotEvent';
import { BotKeyBinding } from './BotKeyBinding';
import { extraMention } from './util';
import { BotPersister } from './BotPersister';
import type { BotStorage } from './BotPersister';
import { DEFAULT_SIZE, MAX_CONTEXT_MESSAGE } from './constants';

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
  size: number = DEFAULT_SIZE;

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
  @command('COMMIT')
  commit() {
    if (!this.prompt.trim()) {
      return;
    }

    const message = this.getNormalizedPrompt();
    const extension = this.activeExtension;

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
          pending: {
            extension,
            response,
          },
        });
      }

      const resMsg = this.getMessageById(responseMessageId)!;

      response.result
        .then(() => {
          this.updateMessageContent(responseMessageId, response.eventSource.result);
        })
        .catch(err => {
          console.error(`[BotModel] commit error: `, err);

          if (err instanceof DOMException && err.name === 'AbortError') {
            // 用户终止了
            return;
          }

          // 回复错误信息
          const errorMessage = `❌ 抱歉，出现了错误: ${err.message}`;
          captureException(err);

          if (extension.type === ExtensionType.Message) {
            this.updateMessageContent(responseMessageId, errorMessage);
          } else {
            this.responseMessage(errorMessage, extension);
          }
        })
        .finally(() => {
          this.resetMessagePending(responseMessageId);
          this.event.emit('MESSAGE_FINISHED', { message: resMsg });
        });

      this.setPrompt('');
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
  @mutation('ADD_MESSAGE', false)
  responseMessage(message: string, extension?: Extension): void {
    this.addMessage({
      uuid: v4(),
      role: Role.Assistant,
      content: message,
      timestamp: Date.now(),
      extension: (extension && this.activeExtension)?.key,
    });
  }

  getMessageById(id: string) {
    return this.history.find(i => i.uuid === id);
  }

  /**
   * 获取上下文信息
   */
  getRecentlyMessages() {
    const lastSummaryIndex = findLastIndex(this.history, i => !!i.summary);

    const sliced = this.history.slice(lastSummaryIndex + 1);

    const filtered = sliced.filter(i => !i.pending).slice(-MAX_CONTEXT_MESSAGE);

    if (filtered.length < MAX_CONTEXT_MESSAGE && lastSummaryIndex > 0) {
      // 补全
      filtered.unshift(this.history[lastSummaryIndex]);
    }

    return filtered;
  }

  /**
   * 计算 Token 数量
   * @param message
   * @returns
   */
  countToken(message: string[]): number {
    return message.reduce((acc, cur) => {
      const token = cur.trim();
      if (token) {
        return acc + token.length;
      }
      return acc;
    }, 0);
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

  /**
   * 清理消息
   */
  @mutation('CLEAR_HISTORY', false)
  clearHistory(): void {
    this.history = [];
    this.clearPendingTask();

    this.event.emit('HISTORY_CLEARED');
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
}
