/**
 * 按数量限额
 */
export class AmountWindowLimit {
  private queue: [number, number][] = [];

  get remain() {
    return this.limit - this.queue.reduce((acc, i) => acc + i[1], 0);
  }

  constructor(private limit: number, private timeout: number) {}

  request(amount: number) {
    this.clearTimeout();

    if (this.remain < amount) {
      return false;
    }

    this.queue.push([Date.now(), amount]);

    return true;
  }

  private clearTimeout() {
    const now = Date.now();

    do {
      const first = this.queue[0]?.[0];
      if (first != null && now - first >= this.timeout) {
        this.queue.shift();
      } else {
        break;
      }
    } while (true);
  }
}
