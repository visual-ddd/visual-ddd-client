import { IDisposable, tryDispose } from '@/lib/utils';
import { makeAutoBindThis, mutation } from '@/lib/store';
import { action, makeObservable, observable } from 'mobx';

import { DEFAULT_SIDEBAR_SIZE } from './constants';
import { BotPagePersister } from './BotPagePersister';
import type { BotPageStorage } from './BotPagePersister';
import { BotSessionStore } from './BotSessionStore';
import { BotPageEvent } from './BotPageEvent';
import { Disposer } from '@wakeapp/utils';

/**
 * 聊天页 Model
 */
export class BotPageModel implements IDisposable {
  /**
   * 事件
   */
  readonly event = new BotPageEvent();
  private persister: BotPagePersister;

  /**
   * 聊天会话
   */
  readonly store: BotSessionStore;

  /**
   * 侧边栏尺寸
   */
  @observable
  size: number = DEFAULT_SIDEBAR_SIZE;

  /**
   * 侧边栏是否折叠
   */
  @observable
  sidebarFolded: boolean = false;

  private disposer = new Disposer();

  constructor() {
    this.persister = new BotPagePersister({
      event: this.event,
      onLoad: data => this.load(data),
    });
    this.store = new BotSessionStore({
      createDefaultSession: false,
    });
    this.initial();

    makeObservable(this);
    makeAutoBindThis(this);
  }

  dispose = () => {
    this.disposer.release();
    tryDispose(this.persister);
    tryDispose(this.store);
  };

  @mutation('SET_SIZE', false)
  setSize(size: number) {
    this.size = size;
    this.event.emit('SIZE_CHANGE', { size });
  }

  @mutation('TOGGLE_SIDEBAR_FOLDED', false)
  toggleSidebarFolded() {
    this.sidebarFolded = !this.sidebarFolded;
    this.event.emit('SIDEBAR_CHANGE', { folded: this.sidebarFolded });
  }

  private initial() {
    this.disposer.push(
      this.store.event.on('SESSION_CHANGE', params => {
        this.event.emit('SESSION_CHANGE', params);
      })
    );
  }

  @action
  private load(data: BotPageStorage) {
    if (data.size != null) {
      this.size = data.size;
    }

    if (data.sidebarFolded != null) {
      this.sidebarFolded = data.sidebarFolded;
    }

    if (data.currentSessionId != null) {
      this.store.activeSession(data.currentSessionId);
    }
  }
}
