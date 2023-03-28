import { action, makeObservable, observable } from 'mobx';
import { captureException } from '@sentry/nextjs';
import { v4 } from 'uuid';
import { Disposer } from '@wakeapp/utils';
import { IDisposable, tryDispose } from '@/lib/utils';
import { command, derive, makeAutoBindThis, mutation } from '@/lib/store';

import { ExtensionType, GLOBAL_EXTENSION_KEY, IBot, Role } from './protocol';
import type { Extension, Message } from './protocol';
import { registry } from './registry';
import { BotEvent } from './BotEvent';
import { BotKeyBinding } from './BotKeyBinding';
import { extraMention } from './util';

/**
 * 机器人
 */
export class BotModel implements IDisposable, IBot {
  /**
   * 事件
   */
  event = new BotEvent();

  private keybinding: BotKeyBinding;

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

  /**
   * 上下文信息
   */
  @derive
  get recentlyMessages() {
    return this.history.filter(i => !i.pending).slice(-3);
  }

  private disposer = new Disposer();

  constructor() {
    this.setAvailableExtensions();

    if (this.activeExtension == null) {
      throw new Error('Global extension not found');
    }

    this.keybinding = new BotKeyBinding({ bot: this });

    makeObservable(this);
    makeAutoBindThis(this);

    this.disposer.push(
      () => tryDispose(this.keybinding),
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

      response.result
        .then(() => {
          this.updateMessageContent(responseMessageId, response.eventSource.result);
        })
        .catch(err => {
          console.error(`[BotModel] commit error: `, err);
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
          this.updateMessagePending(responseMessageId);
        });

      this.setPrompt('');
    } catch (err) {
      console.error(err);
      captureException(err);
      this.responseMessage(`抱歉，出现了错误：${(err as Error).message}`);
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

  @action
  private updateMessageContent(id: string, content: string) {
    const msg = this.history.find(i => i.uuid === id);
    if (msg) {
      msg.content = content;
    }
  }

  @action
  private updateMessagePending(id: string) {
    const msg = this.history.find(i => i.uuid === id && i.pending);
    if (msg) {
      tryDispose(msg.pending?.response.eventSource);
      msg.pending = undefined;
    }
  }

  private getNormalizedPrompt() {
    const value = this.prompt.trim();
    if (this.activeExtension !== this.defaultExtension) {
      return value.slice(`#${this.activeExtension.match}`.length);
    }

    return value;
  }
}
