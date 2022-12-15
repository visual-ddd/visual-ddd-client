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
  private eventBus: EventEmitter = new EventEmitter();

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
    this.eventBus.emit(name, args);
  }
}
