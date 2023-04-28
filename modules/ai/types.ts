export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface Message {
  role?: string;
  content?: string;
}

export interface ChoiceInStream {
  delta: Message;
  finish_reason: string;
  index: number;
}

export interface Choice {
  message: Message;
  finish_reason: string;
  index: number;
}

export interface ChatCompletionMeta {
  id: string;
  object: string;
  created: number;
  model: string;
}

export interface ChatCompletionInStream extends ChatCompletionMeta {
  choices: ChoiceInStream[];
}

export interface ChatCompletion extends ChatCompletionMeta {
  usage: Usage;
  choices: Choice[];
}
