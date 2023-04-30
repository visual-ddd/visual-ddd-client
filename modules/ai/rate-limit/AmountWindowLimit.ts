import { ISerializable } from '@/lib/utils';

/**
 * 按数量限额
 */
export class AmountWindowLimit implements ISerializable<[number, number][]> {
  private queue: [number, number][] = [];

  get remain() {
    return this.limit - this.queue.reduce((acc, i) => acc + i[1], 0);
  }

  constructor(private limit: number, private timeout: number) {}

  fromJSON(data: [number, number][]): void {
    this.queue = data;
  }

  toJSON(): [number, number][] {
    return this.queue.slice(0);
  }

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
