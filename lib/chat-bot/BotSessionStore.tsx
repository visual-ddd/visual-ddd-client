import { makeObservable, observable } from 'mobx';
import { command, derive, makeAutoBindThis, mutation } from '@/lib/store';
import { IDisposable, tryDispose } from '@/lib/utils';
import { v4 } from 'uuid';

import { BotSession } from './BotSession';
import { BotSessionStoreEvent } from './BotSessionStoreEvent';
import { DEFAULT_NAME, DEFAULT_SESSION_PROMPT, DEFAULT_SESSION_ID, DEFAULT_SESSION_REMOVABLE } from './constants';
import type { Prompt } from './types';

const KEY = 'chat-bot-sessions';

export interface BotSessionStoreOption {
  /**
   * 当不存在会话时是否创建默认会话
   * 默认 false
   */
  createDefaultSession?: boolean;
}

/**
 * 聊天多会话支持
 */
export class BotSessionStore implements IDisposable {
  readonly event = new BotSessionStoreEvent();

  /**
   * 当前会话, 惰性初始化
   */
  @observable
  sessions: BotSession[] = [];

  /**
   * 当前激活的会话
   */
  @observable
  active!: string;

  @derive
  get currentActiveSession() {
    return this.sessions.find(i => i.uuid === this.active);
  }

  private options?: BotSessionStoreOption;

  constructor(options: BotSessionStoreOption) {
    this.options = options;
    this.initial();

    makeObservable(this);
    makeAutoBindThis(this);
  }

  dispose = () => {
    this.sessions.forEach(i => tryDispose(i));
    this.sessions = [];
  };

  @command('REACTIVE_SESSION')
  reactiveSession() {
    if (this.currentActiveSession) {
      this.activeSession(this.currentActiveSession.uuid);
    }
  }

  /**
   * 激活会话
   * @param id
   */
  @mutation('ACTIVE_SESSION', false)
  activeSession(id: string) {
    const session = this.sessions.find(i => i.uuid === id);
    if (session) {
      session.active();
      this.active = id;
      this.event.emit('SESSION_CHANGE', { sessionId: id });
    }
  }

  /**
   * 添加会话
   */
  @mutation('ADD_SESSION', false)
  addSession() {
    const session = new BotSession({ uuid: v4() });

    return this.unshiftSession(session);
  }

  /**
   * 导入会话
   * @param prompt
   */
  @mutation('ADD_SESSION_FROM_PROMPT', false)
  addSessionFromPrompt(prompt: Prompt) {
    const session = new BotSession({
      uuid: v4(),
      name: prompt.name,
      system: prompt.system,
      temperature: prompt.temperature,
      maxContextLength: prompt.maxContextLength,
    });

    return this.unshiftSession(session);
  }

  @mutation('REMOVE_SESSION', false)
  removeSession(id: string) {
    const idx = this.sessions.findIndex(s => s.uuid === id);
    if (idx >= 0) {
      const session = this.sessions[idx];

      // 不能删除
      if (!session.removable) {
        return;
      }

      const [removed] = this.sessions.splice(idx, 1);

      if (this.active === id && this.sessions.length) {
        this.activeSession(this.sessions[0].uuid);
      }

      // 销毁
      tryDispose(removed);

      // 删除历史记录
      removed.destroy();

      this.save();
    }
  }

  private unshiftSession(session: BotSession) {
    this.sessions.unshift(session);
    this.save();

    // 立即激活
    this.activeSession(session.uuid);

    return session;
  }

  private initial() {
    const sessionIds = this.load();
    if (sessionIds?.length) {
      this.sessions = sessionIds.map(id => new BotSession({ uuid: id }));
    } else if (this.options?.createDefaultSession) {
      // 初始化
      this.sessions = [
        new BotSession({
          uuid: DEFAULT_SESSION_ID,
          name: DEFAULT_NAME,
          system: DEFAULT_SESSION_PROMPT,
          // 通常默认会话不支持删除
          removable: DEFAULT_SESSION_REMOVABLE,
        }),
      ];
      this.save();
    }

    // 激活会话
    if (this.sessions.length) {
      if (this.sessions.some(i => i.uuid === DEFAULT_SESSION_ID)) {
        this.activeSession(DEFAULT_SESSION_ID);
      } else {
        this.activeSession(this.sessions[0].uuid);
      }
    }
  }

  private load(): string[] | null {
    const data = localStorage.getItem(KEY);
    if (!data) {
      return null;
    }

    return JSON.parse(data) as string[];
  }

  private save() {
    localStorage.setItem(KEY, JSON.stringify(this.sessions.map(s => s.uuid)));
  }
}
