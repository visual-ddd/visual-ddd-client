import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../chat';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';

export const dataObjectBuilder: NextApiHandler = allowMethod(
  'GET',
  withWakedataRequestApiRoute(async (req, res) => {
    const prompt = req.query.prompt as string;

    if (prompt == null) {
      res.status(400).json(createFailResponse(400, 'prompt is required'));
      return;
    }

    chat({
      pipe: res,
      source: req,
      bzCode: 'data-object-builder',
      bzDesc: '数据库建模',
      messages: [
        {
          role: 'system',
          content: '你是一个数据库建模专家, 你会根据用户的提示进行数据库概念建模',
        },
        {
          role: 'user',
          content: `
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
- Reference

---

引用关系的描述：

其中 Reference 类型表示对其他实体的引用，比如 引用了 B 实体的 b 字段，会这样表示: {"type": "Reference", "target": "B", "property": "b", "cardinality": "OneToMany" }

cardinality 可选值有: OneToOne, OneToMany, ManyToOne, ManyToMany

---

如果是主键，需要将字段的 primaryKey 设置为 true


---



举个例子，用户输入: """创建一个用户, 这个用户有多个地址"""", 你应该返回：

[
  {
    "name": "User",
    "title": "用户",
    "properties": [
      {
        "name": "id",
        "title": "用户唯一id",
        "primaryKey": true,
        "type": { "type": "Long" }
      },
      {
        "name": "name",
        "title": "用户名",
        "type": { "type": "String" }
      }
    ]
  },
  {
    "name": "Address",
    "title": "地址",
    "properties": [
      {
        "name": "id",
        "title": "唯一id",
        "primaryKey": true,
        "type": { "type": "Long" }
      },
      {
        "name": "value",
        "title": "详细地址",
        "type": { "type": "String" }
      },
      {
        "name": "userId",
        "title": "用户引用",
        "type": { "type": "Reference", "target": "User", "property": "id", "cardinality": "ManyToOne" }
      }
    ]
  }
]


你可以根据问题创建多个对象，以数组的形式返回。上面的例子只是一个格式示范, 不要照搬，你需要根据用户的提示, 以及你的数据库建模的丰富经验和行业的最佳实践来回答。

---

以 JSON 数组的格式回答，不要解释

---

当你无法理解请求时， 请回答直接返回： 

[SORRY]

不要解释
`,
        },
        {
          role: 'user',
          content: `用户输入: """${prompt}"""`,
        },
      ],
      temperature: 0.7,
    });
  })
);
