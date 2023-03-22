import { EventEmitter } from '@wakeapp/utils';

export type EventDisposer = () => void;

export type EventsWithoutArg<T extends {}> = keyof {
  [P in keyof T as T[P] extends void ? P : never]: void;
};

export type EventsWithArg<T extends {}> = Exclude<keyof T, EventsWithoutArg<T>>;

export class EventBus<
  EventDefinition extends {},
  WithoutArg = EventsWithoutArg<EventDefinition>,
  WithArg = EventsWithArg<EventDefinition>
> {
  /**
   * 模型层事件
   */
  protected eventBus: EventEmitter = new EventEmitter();

  private ready = true;

  // 未触发的事件
  private pending: [string, any][] = [];

  /**
   * 事件总线是否就绪
   *
   * 有一些场景需要延迟触发事件，比如在初始化时，需要先初始化一些数据，然后再通知调用者
   * 在准备就绪后，需要调用 iAmReady() 方法
   *
   */
  get isReady(): boolean {
    return this.ready;
  }

  constructor(options?: { notReadyYet?: boolean }) {
    if (options?.notReadyYet) {
      this.ready = false;
    }
  }

  iAmReady() {
    if (this.ready) {
      throw new Error('EventBus is already ready');
    }

    this.ready = true;

    if (this.pending.length) {
      for (const [name, arg] of this.pending) {
        this.eventBus.emit(name, arg);
      }

      this.pending = [];
    }
  }

  /**
   * 事件订阅
   * @param name
   * @param listener
   */
  on<T extends WithoutArg>(name: T, listener: () => void): EventDisposer;
  // @ts-expect-error
  on<T extends WithArg>(name: T, listener: (arg: EventDefinition[T]) => void): EventDisposer;
  on(name: string, listener: (args: any) => void): EventDisposer {
    this.eventBus.on(name, listener);

    return () => {
      this.eventBus.off(name, listener);
    };
  }

  /**
   * 事件触发
   * @param name
   */
  emit<T extends WithoutArg>(name: T): void;
  // @ts-expect-error
  emit<T extends WithArg>(name: T, arg: EventDefinition[T]): void;
  emit(name: string, args?: any): void {
    if (!this.ready) {
      this.pending.push([name, args]);
      return;
    }

    this.eventBus.emit(name, args);
  }
}
