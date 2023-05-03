import { makeObservable, observable } from 'mobx';
import { IDestroyable, IDisposable, tryDispose } from '@/lib/utils';
import debounce from 'lodash/debounce';
import { makeAutoBindThis, mutation } from '@/lib/store';

import { BotModel } from './BotModel';
import { BotSessionPersister } from './BotSessionPersister';
import type { BotSessionStorage } from './BotSessionPersister';
import { Role } from './protocol';
import { getSubjectSummary } from './registry';

export interface BotSessionOptions {
  uuid: string;
  name?: string;
  system?: string;
  removable?: boolean;
  /**
   * 模型温度，默认 0.7
   */
  temperature?: number;
  /**
   * 最大上下文消息数
   */
  maxContextLength?: number;
}

const DEFAULT_SYSTEM_PROMPT = '';
const DEFAULT_NAME = '';

/**
 * 聊天会话
 */
export class BotSession implements IDisposable, IDestroyable {
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
   * 模型温度, 默认为 0.7
   */
  @observable
  temperature?: number;

  /**
   * 最大上下文消息数
   */
  @observable
  maxContextLength?: number;

  /**
   * 持久化
   */
  private persister: BotSessionPersister;

  private subjectLoading: boolean = false;

  constructor(options: BotSessionOptions) {
    this.uuid = options.uuid;
    this.name = options.name || DEFAULT_NAME;
    this.system = options.system || DEFAULT_SYSTEM_PROMPT;
    this.removable = options.removable ?? true;
    this.temperature = options.temperature;
    this.maxContextLength = options.maxContextLength;

    makeObservable(this);
    makeAutoBindThis(this);

    this.persister = new BotSessionPersister({
      uuid: this.uuid,
      onLoad: this.onLoad,
      initial: this.getDataToSave(),
    });
  }

  dispose = () => {
    this.save.cancel();
    tryDispose(this.persister);
    tryDispose(this.model);
  };

  destroy(): void {
    this.persister.destroy();
    this.model?.destroy();
  }

  active() {
    if (this.model == null) {
      // 初始化 Model
      const self = this;
      this.model = new BotModel({
        uuid: this.uuid,
        metaInfo: {
          get temperature() {
            return self.temperature;
          },
          get maxContextLength() {
            return self.maxContextLength;
          },
          get name() {
            return self.name;
          },
          get system() {
            return self.system;
          },
        },
      });

      this.model.event.on('MESSAGE_ADDED', evt => {
        if (evt.message.role === Role.User && evt.message.content.length && !this.name && !this.subjectLoading) {
          this.detectSubject(evt.message.content);
        }
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

    if (!this.name && this.system.length && !this.subjectLoading) {
      this.detectSubject(this.system);
    }
  }

  /**
   * 设置温度
   * @param temperature
   */
  @mutation('SAVE_TEMPERATURE', false)
  setTemperature(temperature: number) {
    this.temperature = temperature;
    this.save();
  }

  /**
   * 设置最大消息数
   * @param maxContextLength
   */
  @mutation('SAVE_MAX_CONTEXT_LENGTH', false)
  setMaxContextLength(maxContextLength: number) {
    this.maxContextLength = maxContextLength;
    this.save();
  }

  @mutation('LOAD_CHAT_SESSION', false)
  private onLoad(data: BotSessionStorage) {
    this.name = data.name;
    this.system = data.system;
    this.removable = data.removable;
    this.temperature = data.temperature;
    this.maxContextLength = data.maxContextLength;
  }

  private getDataToSave(): BotSessionStorage {
    return {
      uuid: this.uuid,
      name: this.name,
      system: this.system,
      removable: this.removable,
      temperature: this.temperature,
      maxContextLength: this.maxContextLength,
    };
  }

  private detectSubject = async (text: string) => {
    try {
      this.subjectLoading = true;
      const subject = await getSubjectSummary(text);
      if (subject?.length) {
        this.setName(subject);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.subjectLoading = false;
    }
  };

  private save = debounce(() => {
    this.persister.save(this.getDataToSave());
  }, 1000);
}
