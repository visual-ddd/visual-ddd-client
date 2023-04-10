import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../proxy';

export const flowBuilder: NextApiHandler = allowMethod('POST', async (req, res) => {
  const { text } = req.body as {
    text: string;
  };

  if (text == null) {
    res.status(400).json(createFailResponse(400, 'text is required'));
    return;
  }

  chat({
    pipe: res,
    source: req,
    messages: [
      {
        role: 'system',
        content: `你是一个擅长绘制流程图的业务专家，现在你需要根据用户输入的内容，转换为流程图绘制指令。

指令类型如下：
- Start 开始节点
- End 结束节点
- Node 普通节点
- Condition 条件节点
- Edge 连接线

指令格式如下：
- %%Start x="x" y="y"%%
- %%End x="x" y="y"%%
- %%Node name="name in english" label="title in chinese" x="x" y="y"%%
- %%Condition name="name in english" label="title in chinese" x="x" y="y"%%
- %%Edge from="Start|End|name of Node|name of Condition" to="Start|End|name of Node|name of Condition" label="optional label"%%

---

From Example:

Input: """用户注册"""
Response: """
%%Start x="100" y="100"%%
%%Node name="Input" label="填写信息" x="250" y="100"%%
%%Condition name="VerifyInput" label="信息是否填写完整" x="400" y="100"%%
%%Edge from="Start" to="Input"%%
%%Edge from="Input" to="VerifyInput"%%
%%Node name="Submit" label="提交" x="550" y="50"%%
%%Node name="Error" label="显示错误信息" x="550" y="150"%%
%%Edge from="VerifyInput" to="Submit" label="是"%%
%%Edge from="VerifyInput" to="Error" label="否"%%
%%Edge from="Submit" to="End"%%
%%Edge from="Error" to="End"%%
%%End x="700" y="100"%%
"""

Input: """${text}"""
Response: """`,
      },
    ],
    temperature: 1,
    stop: ['"""', 'INPUT'],
  });
});
