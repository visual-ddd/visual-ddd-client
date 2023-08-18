import { NextApiRequest } from 'next';
import { formatDate } from '@wakeapp/utils';

import { ChatModel } from '../constants';

export interface Usage {
  /**
   * 使用的模型
   */
  model: ChatModel;

  /**
   * 业务编码
   */
  code: string;

  /**
   * 业务描述
   */
  desc: string;

  /**
   * 来源信息
   */
  source?: string;

  requestToken: number;

  responseToken: number;
}

/**
 * AI 用量统计
 * @param usage
 */
export function reportUsage(req: NextApiRequest, usage: Usage) {
  const session = req.session.content;

  if (session == null) {
    return;
  }

  req
    .request(
      '/wd/visual/web/ai-usage-statistics/create',
      {
        account: session.accountNo,
        userId: session.userId,
        businessCode: usage.code,
        businessDesc: usage.desc,
        model: usage.model,
        reportSource: 'client',
        requestTime: formatDate(new Date()),
        requestTokens: usage.requestToken,
        responseTokens: usage.responseToken,
        totalTokens: usage.requestToken + usage.responseToken,
      },
      {
        method: 'POST',
      }
    )
    .catch(err => {
      console.error('AI 用量统计失败', err);
    });
}
