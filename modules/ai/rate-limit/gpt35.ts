import { AmountWindowLimit } from './AmountWindowLimit';
import { CountWindowLimit } from './CountWindowLimit';

/**
 * GTP 3.5 限额
 */
export class GPT35Limit {
  // 5 requests per minute
  private countLimit = new CountWindowLimit(3, 1000 * 60);

  // 40k token per minute
  private amountLimit = new AmountWindowLimit(40 * 1000, 1000 * 60);

  request(token: number) {
    return this.countLimit.request() && this.amountLimit.request(token);
  }
}
