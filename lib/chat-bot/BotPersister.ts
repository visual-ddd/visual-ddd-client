import type { BotEvent } from './BotEvent';
import localforage from 'localforage';
import { IDisposable } from '../utils';
import { cloneDeep, debounce, Disposer, omit } from '@wakeapp/utils';
import { Message } from './protocol';
import { toJS } from 'mobx';

const KEY = 'chat-bot';

type PersistMessage = Omit<Message, 'pending'>;

const OMIT_KEYS: (keyof Message)[] = ['pending'];

export class BotPersister implements IDisposable {
  private event: BotEvent;
  private list: PersistMessage[] = [];
  private onLoad: (list: PersistMessage[]) => void;

  private disposer = new Disposer();

  constructor(inject: { event: BotEvent; onLoad: (list: PersistMessage[]) => void }) {
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
      this.event.on('MESSAGE_FINISHED', handleMessageUpdate)
    );

    const list = await localforage.getItem<Message[]>(KEY);

    if (list) {
      this.list = list;
      this.onLoad(cloneDeep(list));
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

    localforage.setItem(KEY, this.list);
  }, 5000);
}
