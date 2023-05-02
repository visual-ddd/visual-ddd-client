import { addRequestControlHandler } from './RequestControlChain';
import { checkPlan } from './planCheck';
import { checkRateLimit } from './rate-limit-check';

addRequestControlHandler(checkPlan);
addRequestControlHandler(checkRateLimit);

export { checkRequest, RequestControlError, RequestControlErrorCode } from './RequestControlChain';
