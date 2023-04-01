import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings';

const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});
const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

const embedding = new OpenAIEmbeddings();
const store = await PineconeStore.fromExistingIndex(embedding, {
  pineconeIndex,
});

const result = await store.similaritySearchWithScore('实体和聚合根的区别', 2);

console.log(result);
