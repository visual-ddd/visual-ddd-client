import { ISerializable } from '@/lib/utils';

export type Data = number[];

/**
 * 按请求量限额
 */
export class CountWindowLimit implements ISerializable<Data> {
  private queue: number[] = [];

  get count() {
    return this.queue.length;
  }

  get remain() {
    this.clearTimeout();

    return this.limit - this.count;
  }

  constructor(private limit: number, private timeout: number) {}

  fromJSON(data: Data) {
    this.queue = data;
  }

  toJSON(): Data {
    return this.queue.slice(0);
  }

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
