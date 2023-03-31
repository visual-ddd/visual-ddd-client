import { assert } from './assert';
import { IDisposable } from './IDisposable';

export class TimeoutError extends Error {
  static isTimeoutError(error: any): error is TimeoutError {
    return error instanceof TimeoutError;
  }
}

export class TimeoutController implements IDisposable {
  /**
   * 计时器
   */
  private timer: any;
  private timeout: number;
  private pending?: Function;

  /**
   * @param timeout 超时时间
   */
  constructor(timeout: number) {
    this.timeout = timeout;
  }

  refresh() {
    this.schedule();
  }

  dispose() {
    this.clearTimer();
  }

  start(): Promise<never> {
    assert(!this.pending, '已经调用了 start 方法');

    return new Promise<never>((resolve, reject) => {
      this.pending = reject;

      this.schedule();
    });
  }

  private schedule() {
    if (!this.pending) {
      return;
    }

    this.clearTimer();

    this.timer = setTimeout(() => {
      this.reject();
    }, this.timeout);
  }

  private clearTimer() {
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private reject() {
    if (!this.pending) {
      return;
    }

    this.pending(new TimeoutError('Timeout'));

    this.pending = undefined;
  }
}
