import { ISerializable } from '@/lib/utils';

interface Data {
  lastUpdated: number;
  count: number;
}

export class CountLimit implements ISerializable<Data> {
  private lastUpdated: number = 0;

  count: number = 0;

  /**
   * 剩余
   */
  get remain(): number {
    this.update();
    return Math.max(this.limit - this.count, 0);
  }

  constructor(private limit: number, private timeout: number) {}

  fromJSON(data: Data): void {
    this.lastUpdated = data.lastUpdated;
    this.count = data.count;
  }

  toJSON(): Data {
    return {
      lastUpdated: this.lastUpdated,
      count: this.count,
    };
  }

  request(amount: number = 1) {
    this.update();
    this.count += amount;

    return this.count <= this.limit;
  }

  private update() {
    const now = Date.now();
    if (now - this.lastUpdated >= this.timeout) {
      // 超时
      this.count = 0;
      this.lastUpdated = now;
    }
  }
}
