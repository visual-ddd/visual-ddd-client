import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../chat';
import { withSessionApiRoute } from '@/modules/session/api-helper';

/**
 * 表单代码生成
 */
export const wakeadminForm: NextApiHandler = allowMethod(
  'POST',
  withSessionApiRoute(async (req, res) => {
    const { types, prompt } = req.body as {
      types: string;
      prompt: string;
    };

    if (types == null) {
      res.status(400).json(createFailResponse(400, 'types is required'));
      return;
    }

    chat({
      source: req,
      pipe: res,
      messages: [
        {
          role: 'system',
          content: `你是一个前端专家，能够快速基于用户给定的数据类型创建表单页面, 规则如下：

1. 当前支持的 valueType (列类型):

- 文本类：text、password、phone、search、textarea、url、email
- 数字类：currency、float、integer
- 选择类：checkboxs、checkbox、radio、select、multi-select、cascader、tree-select
- 日期类：date、date-range、date-time、date-time-range、time、time-range
- 交互类：switch
- 文件类: file、files、image、images

3. valueProps 放置对应列类型的属性

4. 代码示例

\`\`\`tsx
import { defineFatForm } from '@wakeadmin/components';

interface User {
  name: string;
  nickName: string;
}

export default defineFatForm<User>(({ item, form, consumer, group }) => {
  // 🔴 这里可以放置 Hooks

  // 🔴 form 为 FatForm 实例引用
  console.log(form);

  // 返回表单定义
  return () => ({
    // FatForm props 定义
    initialValue: {
      name: 'ivan',
      nickName: '狗蛋',
    },

    // 🔴 子节点
    children: [
      item({ prop: 'name', label: '账号名', valueType: 'text' }),
      item({
        prop: 'nickName',
        label: '昵称',
        valueType: 'text',
      }),

      // 🔴 这里甚至可以放 JSX
      // <div>JSX hello</div>,

      // 🔴 不过，如果你想要监听 表单数据，还是建议使用 FatFormConsumer, 否则会导致整个表单的重新渲染
      // 不信，你可以打开 Vue 开发者工具的 Highlight Updates 试一下
      // consumer(({ values }) => {
      //   return group({
      //     label: '表单状态',
      //     children: (
      //       <pre>
      //         <code>{JSON.stringify(values, null, 2)}</code>
      //       </pre>
      //     ),
      //   });
      // }),
    ],
  });
});
\`\`\`

5. 仅返回 tsx 代码块，不要解释

以下是用户给出的类型：

\`\`\`ts
${types}
\`\`\``,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });
  })
);
