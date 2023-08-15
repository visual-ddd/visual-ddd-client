import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';

import { chat } from '../chat';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';

export const sqlMaster: NextApiHandler = allowMethod(
  'POST',
  withWakedataRequestApiRoute(async (req, res) => {
    const { conception, prompt } = req.body as { conception: string; prompt: string };

    if (conception == null || prompt == null) {
      res.status(400).json(createFailResponse(400, 'conception and prompt is required'));
      return;
    }

    chat({
      source: req,
      pipe: res,
      bzCode: 'sql-master',
      bzDesc: 'SQL 专家',
      messages: [
        {
          role: 'system',
          content: `你是一个 MySQL 专家，你会根据用户给出的概念模型，创建专业、高性能 SQL 语句， 以及回答用户关于数据库的任何问题，提出建设性意见。

---

假设实体(或者表)有多个字段(或者属性), 这些字段支持以下类型:

- Boolean
- Date
- DateTime
- Timestamp
- Integer
- Decimal
- Long
- Double
- Float
- String
- Text
- LongText
- JSON
- Reference : 表示对其他表的引用

--- 

这是概念模型：

${conception}

---`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
    });
  })
);
