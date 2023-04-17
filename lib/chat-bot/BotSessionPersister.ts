import localforage from 'localforage';
import { IDestroyable } from '@/lib/utils';

export interface BotSessionStorage {
  uuid: string;
  name: string;
  system: string;
  removable: boolean;

  /**
   * 模型温度，默认 0.7
   */
  temperature?: number;
  maxContextLength?: number;
}

export interface BotSessionPersisterOptions {
  uuid: string;
  onLoad: (data: BotSessionStorage) => void;
  initial?: BotSessionStorage;
}

const KEY_PREFIX = 'chat-bot-session-';

export class BotSessionPersister implements IDestroyable {
  private options: BotSessionPersisterOptions;
  private get key() {
    return `${KEY_PREFIX}${this.options.uuid}`;
  }

  constructor(inject: BotSessionPersisterOptions) {
    this.options = inject;

    this.initial();
  }

  save(value: BotSessionStorage) {
    localforage.setItem(this.key, value);
  }

  destroy(): void {
    localforage.removeItem(this.key);
  }

  private async initial() {
    const data = await localforage.getItem<BotSessionStorage>(this.key);
    if (data) {
      this.options.onLoad(data);
    } else if (this.options.initial) {
      this.save(this.options.initial);
    }
  }
}
