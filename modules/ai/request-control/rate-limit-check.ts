import { getBasicModelRateLimit } from '../rate-limit';

import { RequestControlError, RequestControlErrorCode, RequestControlHandler } from './RequestControlChain';

export const checkRateLimit: RequestControlHandler = async params => {
  const limit = getBasicModelRateLimit(params.model);

  if (!(await limit.requestUsage(params.account, params.amount))) {
    throw new RequestControlError(RequestControlErrorCode.RateLimit, limit.exceedMessage ?? '请求过于频繁，请稍后重试');
  }
};
