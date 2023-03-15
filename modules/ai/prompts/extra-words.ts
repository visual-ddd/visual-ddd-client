import { PromptTemplate } from 'langchain/prompts';
import { openAI } from '../model';

const template = `Summarize and extract the important nouns and verbs from the text. You response  JSON array, for example ["hello", "world"]. The text is. The text is: '''{text}'''`;
const promptTemplate = new PromptTemplate({
  template,
  inputVariables: ['text'],
});

export async function extraWords(text: string): Promise<string[]> {
  const input = await promptTemplate.format({ text });
  console.log('asking chatgpt:', input);
  const res = await openAI.call(input);
  console.log('response:', res);

  return JSON.parse(res);
}
