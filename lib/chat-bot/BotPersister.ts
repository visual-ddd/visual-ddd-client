import type { BotEvent } from './BotEvent';
import localforage from 'localforage';
import { IDisposable } from '../utils';
import { cloneDeep, debounce, Disposer, omit } from '@wakeapp/utils';
import { Message } from './protocol';
import { toJS } from 'mobx';
import { DEFAULT_SIZE } from './constants';

const KEY = 'chat-bot';

type PersistMessage = Omit<Message, 'pending'>;

export interface BotStorage {
  history: PersistMessage[];
  size: number;
}

const OMIT_KEYS: (keyof Message)[] = ['pending'];

export class BotPersister implements IDisposable {
  private event: BotEvent;
  private list: PersistMessage[] = [];
  private onLoad: (list: BotStorage) => void;
  private size: number = DEFAULT_SIZE;

  private disposer = new Disposer();

  constructor(inject: { event: BotEvent; onLoad: (data: BotStorage) => void }) {
    this.event = inject.event;
    this.onLoad = inject.onLoad;

    this.initial();
  }

  dispose() {
    this.disposer.release();
    this.save.cancel();
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
      this.event.on('SIZE_CHANGE', params => {
        this.size = params.size;
        this.save();
      }),
      this.event.on('HISTORY_CLEARED', () => {
        this.list = [];
        this.save();
      })
    );

    const data = await localforage.getItem<BotStorage>(KEY);

    if (data) {
      const { history, size } = data;
      this.list = (history ?? []).filter(i => i.content);
      this.size = size ?? DEFAULT_SIZE;

      // 避免修改到原始数据
      this.onLoad(
        cloneDeep({
          history: this.list,
          size: this.size,
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
    this.list = this.list.slice(-100);

    localforage.setItem<BotStorage>(KEY, {
      history: this.list,
      size: this.size,
    });
  }, 5000);
}
