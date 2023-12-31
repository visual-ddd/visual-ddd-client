import { ISerializable } from '@/lib/utils';
import { AmountWindowLimit } from './AmountWindowLimit';
import { CountWindowLimit } from './CountWindowLimit';

interface Data {
  count: unknown;
  amount: unknown;
}

const DEFAULT_COUNT_LIMIT = 15;
const DEFAULT_AMOUNT_LIMIT = 100 * 1000;

/**
 * GTP 3.5 限额
 */
export class GPT35Limit implements ISerializable<Data> {
  // 15 requests per minute
  private countLimit = new CountWindowLimit(DEFAULT_COUNT_LIMIT, 1000 * 60);

  // 100k token(request) per minute
  private amountLimit = new AmountWindowLimit(DEFAULT_AMOUNT_LIMIT, 1000 * 60);

  get remain() {
    return {
      count: this.countLimit.remain,
      amount: this.amountLimit.remain,
    };
  }

  request(token: number) {
    return this.countLimit.request() && this.amountLimit.request(token);
  }

  fromJSON(data: Data): void {
    this.countLimit.fromJSON(data.count as any);
    this.amountLimit.fromJSON(data.amount as any);
  }

  toJSON(): Data {
    return {
      count: this.countLimit.toJSON(),
      amount: this.amountLimit.toJSON(),
    };
  }
}
