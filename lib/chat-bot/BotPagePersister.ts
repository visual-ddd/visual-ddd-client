import localforage from 'localforage';
import { Disposer, debounce } from '@wakeapp/utils';
import { IDisposable } from '@/lib/utils';
import type { BotPageEvent } from './BotPageEvent';

export interface BotPageStorage {
  size?: number;
  sidebarFolded?: boolean;
  currentSessionId?: string;
}

export interface BotPagePersisterOptions {
  onLoad: (data: BotPageStorage) => void;
  event: BotPageEvent;
}

const KEY = 'chat-page';

export class BotPagePersister implements IDisposable {
  private options: BotPagePersisterOptions;
  private event: BotPageEvent;
  private disposer = new Disposer();
  private state: BotPageStorage = {};

  constructor(inject: BotPagePersisterOptions) {
    this.options = inject;
    this.event = this.options.event;

    this.initial();
  }

  dispose = () => {
    this.disposer.release();
  };

  private async initial() {
    const data = await localforage.getItem<BotPageStorage>(KEY);

    if (data) {
      this.state = data;
      this.options.onLoad(data);
    }

    this.disposer.push(
      this.event.on('SIZE_CHANGE', params => {
        this.save({ size: params.size });
      }),
      this.event.on('SIDEBAR_CHANGE', params => {
        this.save({ sidebarFolded: params.folded });
      }),
      this.event.on('SESSION_CHANGE', params => {
        this.save({ currentSessionId: params.sessionId });
      }),
      () => {
        this.save.cancel();
      }
    );
  }

  private save = debounce((value: Partial<BotPageStorage>) => {
    localforage.setItem(KEY, { ...this.state, ...value });
  }, 2000);
}
