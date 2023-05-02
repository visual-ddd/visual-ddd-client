import type { BotEvent } from './BotEvent';
import localforage from 'localforage';
import { toJS } from 'mobx';
import { cloneDeep, debounce, Disposer, omit } from '@wakeapp/utils';

import { IDestroyable, IDisposable } from '../utils';
import { Message } from './protocol';
import { MAX_HISTORY_LENGTH } from './constants';

const KEY_PREFIX = 'chat-bot-history-';

type PersistMessage = Omit<Message, 'pending'>;

export interface BotStorage {
  history: PersistMessage[];
}

const OMIT_KEYS: (keyof Message)[] = ['pending', 'error'];

export class BotPersister implements IDisposable, IDestroyable {
  private uuid: string;
  private event: BotEvent;
  private list: PersistMessage[] = [];
  private onLoad: (list: BotStorage) => void;

  private get key() {
    return `${KEY_PREFIX}${this.uuid}`;
  }

  private disposer = new Disposer();

  constructor(inject: { uuid: string; event: BotEvent; onLoad: (data: BotStorage) => void }) {
    this.uuid = inject.uuid;
    this.event = inject.event;
    this.onLoad = inject.onLoad;

    this.initial();
  }

  dispose() {
    this.disposer.release();
    this.save.cancel();
  }

  destroy(): void {
    localforage.removeItem(this.key);
  }

  private async initial() {
    const handleMessageUpdate = (params: { message: Message }) => {
      const item = this.list.find(i => i.uuid === params.message.uuid);
      if (item) {
        Object.assign(item, this.normalizeMessage(params.message));

        this.save();
      }
    };
    this.disposer.push(
      this.event.on('MESSAGE_ADDED', params => {
        this.list.push(this.normalizeMessage(params.message));
        this.save();
      }),
      this.event.on('MESSAGE_REMOVED', params => {
        const idx = this.list.findIndex(i => i.uuid === params.message.uuid);
        if (idx !== -1) {
          this.list.splice(idx, 1);
          this.save();
        }
      }),
      this.event.on('MESSAGE_UPDATED', handleMessageUpdate),
      this.event.on('MESSAGE_FINISHED', handleMessageUpdate),
      this.event.on('HISTORY_CLEARED', () => {
        this.list = [];
        this.save();
      })
    );

    const data = await localforage.getItem<BotStorage>(this.key);

    if (data) {
      const { history } = data;
      this.list = (history ?? []).filter(i => i.content || i.extension);

      // 避免修改到原始数据
      this.onLoad(
        cloneDeep({
          history: this.list,
        })
      );
    }
  }

  private normalizeMessage(message: Message) {
    return omit(toJS(message), OMIT_KEYS) as PersistMessage;
  }

  /**
   * 持久化
   */
  private save = debounce(() => {
    this.list = this.list.slice(-MAX_HISTORY_LENGTH);

    localforage.setItem<BotStorage>(this.key, {
      history: this.list,
    });
  }, 2000);
}
