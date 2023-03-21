import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { NextApiHandler } from 'next';
import { chat } from '../proxy';

export const wordsToUbiquitousLanguage: NextApiHandler = allowMethod('GET', async (req, res) => {
  const words = req.query.words as string | undefined;

  if (words == null) {
    res.status(400).json(createFailResponse(400, 'words is required'));
    return;
  }
  const data = JSON.stringify(
    words
      .split(',')
      .map(i => i.trim())
      .filter(Boolean)
  );

  chat({
    pipe: res,
    messages: [
      {
        role: 'system',
        content: 'You are a language expert, skilled at summarizing and translate.',
      },
      {
        role: 'user',
        content: `Give you a array of word and you respond with a JSON containing the following fields: word (conception), English translation (englishName), noun definition (definition), and example (example).

for example, I give you：

["资产"]
          `,
      },
      {
        role: 'assistant',
        content: `[
  {
    "conception": "资产",
    "englishName": "Asset",
    "definition": "一种可被获取、拥有并控制并为所用、者产生价值的资源。",
    "example": "公司的资产包括现金、土地、设备、专利等。"
  }
]`,
      },
      { role: 'user', content: `now the input is：'''${data}'''` },
    ],
  });
});
