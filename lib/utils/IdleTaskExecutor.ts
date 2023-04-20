import { IDisposable } from './IDisposable';

export class IdleTaskExecutor implements IDisposable {
  private idleTasks: (() => void)[] = [];
  private idleCallbackHandler?: number;

  dispose() {
    if (this.idleCallbackHandler != null) {
      window.cancelIdleCallback(this.idleCallbackHandler);
      this.idleCallbackHandler = undefined;
    }
  }

  addIdleTask(task: () => void) {
    this.idleTasks.push(task);

    this.runIdleTasks();
  }

  private runIdleTasks() {
    if (this.idleCallbackHandler != null) {
      window.cancelIdleCallback(this.idleCallbackHandler);
      this.idleCallbackHandler = undefined;
    }

    if (this.idleTasks.length === 0) {
      return;
    }

    this.idleCallbackHandler = window.requestIdleCallback(() => {
      const clone = this.idleTasks;
      this.idleTasks = [];

      let task: (() => void) | undefined;
      while ((task = clone.shift())) {
        task?.();
      }

      if (this.idleTasks.length) {
        this.runIdleTasks();
      }
    });
  }
}
