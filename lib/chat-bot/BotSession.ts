import { makeObservable, observable } from 'mobx';
import { IDisposable, tryDispose } from '@/lib/utils';
import debounce from 'lodash/debounce';
import { makeAutoBindThis, mutation } from '@/lib/store';

import { BotModel } from './BotModel';
import { BotSessionPersister } from './BotSessionPersister';
import type { BotSessionStorage } from './BotSessionPersister';

export interface BotSessionOptions {
  uuid: string;
  name?: string;
  system?: string;
  removable?: boolean;
}

const DEFAULT_SYSTEM_PROMPT = '';
const DEFAULT_NAME = '随便聊聊';

/**
 * 聊天会话
 */
export class BotSession implements IDisposable {
  /**
   * 会话唯一 id
   */
  readonly uuid: string;

  /**
   * 会话模型
   * 惰性加载
   */
  model?: BotModel;

  /**
   * 会话标题
   */
  @observable
  name: string;

  /**
   * 会话 system prompt
   */
  @observable
  system: string;

  /**
   * 是否支持删除
   */
  @observable
  removable: boolean;

  /**
   * 持久化
   */
  private persister: BotSessionPersister;

  constructor(options: BotSessionOptions) {
    this.uuid = options.uuid;
    this.name = options.name || DEFAULT_NAME;
    this.system = options.system || DEFAULT_SYSTEM_PROMPT;
    this.removable = options.removable ?? true;

    makeObservable(this);
    makeAutoBindThis(this);

    this.persister = new BotSessionPersister({
      uuid: this.uuid,
      onLoad: this.onLoad,
      initial: {
        removable: this.removable,
        uuid: this.uuid,
        name: this.name,
        system: this.system,
      },
    });
  }

  dispose = () => {
    this.save.cancel();
    tryDispose(this.persister);
    tryDispose(this.model);
  };

  active() {
    if (this.model == null) {
      // 初始化 Model
      const self = this;
      this.model = new BotModel({
        uuid: this.uuid,
        metaInfo: {
          get name() {
            return self.name;
          },
          get system() {
            return self.system;
          },
        },
      });
    }

    this.model.active();
  }

  /**
   * 修改名称
   * @param name
   */
  @mutation('SAVE_NAME', false)
  setName(name: string) {
    this.name = name;
    this.save();
  }

  /**
   * 修改 system prompt
   * @param system
   */
  @mutation('SAVE_SYSTEM_PROMPT', false)
  setSystem(system: string) {
    this.system = system;
    this.save();
  }

  @mutation('LOAD_CHAT_SESSION', false)
  private onLoad(data: BotSessionStorage) {
    this.name = data.name;
    this.system = data.system;
    this.removable = data.removable;
  }

  private save = debounce(() => {
    this.persister.save({
      uuid: this.uuid,
      name: this.name,
      system: this.system,
      removable: this.removable,
    });
  }, 1000);
}
