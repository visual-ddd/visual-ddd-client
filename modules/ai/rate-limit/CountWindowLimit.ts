/**
 * 按请求量限额
 */
export class CountWindowLimit {
  private queue: number[] = [];

  get count() {
    return this.queue.length;
  }

  constructor(private limit: number, private timeout: number) {}

  request() {
    this.clearTimeout();
    if (this.queue.length >= this.limit) {
      return false;
    }

    this.queue.push(Date.now());

    return true;
  }

  private clearTimeout() {
    const now = Date.now();

    do {
      const first = this.queue[0];
      if (first != null && now - first >= this.timeout) {
        this.queue.shift();
      } else {
        break;
      }
    } while (true);
  }
}
