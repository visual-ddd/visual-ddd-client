import localforage from 'localforage';
import { Disposer } from '@wakeapp/utils';
import { IDisposable } from '@/lib/utils';
import type { BotWindowEvent } from './BotWindowEvent';

export interface BotWindowStorage {
  size: number;
}

export interface BotWindowPersisterOptions {
  onLoad: (data: BotWindowStorage) => void;
  event: BotWindowEvent;
}

const KEY = 'chat-window';

export class BotWindowPersister implements IDisposable {
  private options: BotWindowPersisterOptions;
  private event: BotWindowEvent;
  private disposer = new Disposer();

  constructor(inject: BotWindowPersisterOptions) {
    this.options = inject;
    this.event = this.options.event;

    this.initial();
  }

  dispose = () => {
    this.disposer.release();
  };

  private save(value: BotWindowStorage) {
    localforage.setItem(KEY, value);
  }

  private async initial() {
    const data = await localforage.getItem<BotWindowStorage>(KEY);
    if (data) {
      this.options.onLoad(data);
    }

    this.disposer.push(
      this.event.on('SIZE_CHANGE', params => {
        this.save({ size: params.size });
      })
    );
  }
}
