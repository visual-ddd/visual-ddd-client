import { allowMethod } from '@/lib/api';
import { createFailResponse } from '@/modules/backend-node';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { NextApiHandler } from 'next';

import { OPENAI_API_KEY, OPENAI_BASE_PATH, PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX } from '../config';

import { chat } from '../proxy';

let pineconeStore: PineconeStore;

async function querySimilar(text: string) {
  if (pineconeStore) {
    return pineconeStore.similaritySearch(text, 1);
  }

  const client = new PineconeClient();
  await client.init({
    apiKey: PINECONE_API_KEY,
    environment: PINECONE_ENVIRONMENT,
  });
  const pineconeIndex = client.Index(PINECONE_INDEX);
  const embedding = new OpenAIEmbeddings(
    {
      openAIApiKey: OPENAI_API_KEY,
    },
    {
      basePath: OPENAI_BASE_PATH,
    }
  );
  pineconeStore = await PineconeStore.fromExistingIndex(embedding, { pineconeIndex });

  return pineconeStore.similaritySearch(text, 1);
}

/**
 * DDD 专业领域问答
 */
export const dddMaster: NextApiHandler = allowMethod('POST', async (req, res) => {
  const text = req.body?.text as string;

  if (text == null) {
    res.status(400).json(createFailResponse(400, 'text is required'));
    return;
  }

  const similar = await querySimilar(text);
  const context = similar?.[0]?.pageContent;

  console.log(`ddd-master: ${text} => ${context}`);

  chat({
    pipe: res,
    messages: [
      {
        role: 'system',
        content: `你是一个经验丰富的领域驱动设计(DDD)专家和软件专家。

- 我会给你一些上下文信息，你结合上下文回答用户的问题。
- 如果你无法回答，或者无法从上下文中获取必要的信息，请返回："抱歉，我不知道怎么帮助你"
- 返回 markdown 格式

---

以下是上下文信息:

${context}

---
`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 1,
  });
});
