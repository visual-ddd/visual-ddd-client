/**
 * 模型基类
 */
import { EventArgument, EventBus, EventName, inject, injectable } from '@wakeapp/framework-core';

@injectable()
export class BaseModel {
  @inject('DI.global.eventBus')
  protected eventBus!: EventBus;

  protected emit<N extends EventName, A extends EventArgument<N>>(name: N, args: A): void {
    this.eventBus.emit(name, args);
  }

  protected emitError(error: Error) {
    this.eventBus.emit('Event.global.error', error);
  }
}
