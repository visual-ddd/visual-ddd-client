import { ISerializable } from '@/lib/utils';
import { AmountWindowLimit } from './AmountWindowLimit';
import { CountWindowLimit } from './CountWindowLimit';

interface Data {
  count: unknown;
  amount: unknown;
}

const DEFAULT_COUNT_LIMIT = 25;
const DEFAULT_AMOUNT_LIMIT = 20 * 1000;

/**
 * GTP 4 限额
 */
export class GPT4Limit implements ISerializable<Data> {
  // 25 requests per 3 hour
  private countLimit = new CountWindowLimit(DEFAULT_COUNT_LIMIT, 1000 * 60 * 60 * 3);

  // 20k token(request) per minute
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
