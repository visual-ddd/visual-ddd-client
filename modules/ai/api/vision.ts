import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../chat';

/**
 * 愿景生成
 */
export const vision: NextApiHandler = allowMethod('POST', async (req, res) => {
  const text = req.body?.text as string;

  if (text == null) {
    res.status(400).json(createFailResponse(400, 'text is required'));
    return;
  }

  chat({
    source: req,
    pipe: res,
    messages: [
      {
        role: 'system',
        content: `产品愿景是对产品顶层价值设计，对产品目标用户、核心价值、差异化竞争点等信息达成一致，避免产品偏离方向。

-  常见的模板句式：
"""为了{目标用户} 的 {业务}，这个{系统名称}，是一个{系统定义}，它可以{系统核心功能}，而不像{与其他竞品的差异},  我们能{系统优势}"""

示例
"""
为了满足内外部人员，他们的在线请假、自动考勤统计和外部人员管理的需求，我们建设这个在线请假考勤系统，它是一个在线请假平台，可以自动考勤统计。它可以同时支持内外网请假，同时管理内外部人员请假和定期考勤分析，而不像 HR 系统，只管理内部人员，且只能内网使用。我们的产品内外网皆可使用，可实现内外部人员无差异管理
"""

- 请你对用户的输入内容进行总结和提炼，尽量用一句话说清楚。
- 如果用户输入的信息不够清晰，你应该立即回答 "无法生成"，并对用户进行提问，以获取更多有效信息。

用户输入: """${text}"""
你的响应: """`,
      },
    ],
    temperature: 0.7,
    stop: '"""',
  });
});
