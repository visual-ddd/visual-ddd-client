import { IDisposable, tryDispose } from '@/lib/utils';
import { command, makeAutoBindThis, mutation } from '@/lib/store';
import { action, makeObservable, observable } from 'mobx';

import { BotWindowKeyBinding } from './BotWindowKeyBinding';
import { DEFAULT_WINDOW_SIZE } from './constants';
import { BotWindowEvent } from './BotWindowEvent';
import { BotWindowPersister } from './BotWindowPersister';
import type { BotWindowStorage } from './BotWindowPersister';
import { BotSessionStore } from './BotSessionStore';

/**
 * 聊天窗 Model
 */
export class BotWindowModel implements IDisposable {
  readonly keybinding: BotWindowKeyBinding;
  /**
   * 事件
   */
  readonly event = new BotWindowEvent();

  private persister: BotWindowPersister;

  /**
   * 聊天会话k
   */
  readonly store: BotSessionStore;

  /**
   * 窗口尺寸
   */
  @observable
  size: number = DEFAULT_WINDOW_SIZE;

  constructor() {
    this.keybinding = new BotWindowKeyBinding({ bot: this });
    this.persister = new BotWindowPersister({
      event: this.event,
      onLoad: data => this.load(data),
    });
    this.store = new BotSessionStore({
      createDefaultSession: true,
    });

    makeObservable(this);
    makeAutoBindThis(this);
  }

  dispose = () => {
    tryDispose(this.keybinding);
    tryDispose(this.persister);
    tryDispose(this.store);
  };

  @mutation('SET_SIZE', false)
  setSize(size: number) {
    this.size = size;
    this.event.emit('SIZE_CHANGE', { size });
  }

  @command('SHOW')
  show() {
    this.event.emit('SHOW');
    this.store.reactiveSession();
  }

  @action
  private load(data: BotWindowStorage) {
    this.size = data.size;
  }
}
