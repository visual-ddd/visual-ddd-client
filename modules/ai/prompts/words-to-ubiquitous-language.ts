import type { UbiquitousLanguageItem } from '@/modules/domain/ubiquitous-language-design/types';
import { PromptTemplate } from 'langchain/prompts';
import { openAI } from '../model';

const template = `I give you a array of nouns and you respond with a JSON containing the following fields: noun (conception), English translation (englishName), noun definition (definition), and example (example).

for example, I give you：

["资产"]

your response is a json array：

[
  {{
    "conception": "资产",
    "englishName": "Asset",
    "definition": "一种可被获取、拥有并控制并为所用、者产生价值的资源。",
    "example": "公司的资产包括现金、土地、设备、专利等。"
  }}
]

now the input is：'''{input}'''`;

const promptTemplate = new PromptTemplate({
  template,
  inputVariables: ['input'],
});

/**
 * 见单词转换为统一语言
 * @param words
 * @returns
 */
export async function wordsToUbiquitousLanguage(words: string[]): Promise<UbiquitousLanguageItem[]> {
  const input = await promptTemplate.format({ input: JSON.stringify(words) });
  console.log('asking chatgpt:', input);
  const res = await openAI.call(input);
  console.log('response:', res);

  return JSON.parse(res);
}
