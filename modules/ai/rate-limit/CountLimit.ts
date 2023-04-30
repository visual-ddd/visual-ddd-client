export class CountLimit {
  private lastUpdated: number = 0;

  count: number = 0;

  constructor(private limit: number, private timeout: number) {}

  request(amount: number = 1) {
    const now = Date.now();
    if (now - this.lastUpdated >= this.timeout) {
      // 超时
      this.count = 0;
      this.lastUpdated = now;
    }

    this.count += amount;

    return this.count <= this.limit;
  }
}
