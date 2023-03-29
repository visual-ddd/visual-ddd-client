import { action, makeObservable, observable } from 'mobx';
import { makeAutoBindThis } from '@/lib/store';
import { IDisposable, tryDispose } from '@/lib/utils';
import { EventStream, EventStreamOptions } from './stream';

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface Message {
  role: string;
  content?: string;
}

interface Choice {
  delta: Message;
  finish_reason: string;
  index: number;
}

interface ChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: Usage;
  choices: Choice[];
}

const DONE = '[DONE]';

export interface OpenAIEventSourceModelOptions<Result = any> {
  initialMessage?: string;
  decode: (result: string) => Result;
}

export class OpenAIEventSourceModel<Result = any> implements IDisposable {
  /**
   * 收集的结果
   */
  @observable
  result: string = '';

  @observable
  loading: boolean = false;

  @observable
  error?: Error;

  private disposed = false;

  private eventStream?: EventStream;
  private options: OpenAIEventSourceModelOptions<Result>;

  constructor(options: OpenAIEventSourceModelOptions<Result>) {
    this.options = options;

    if (this.options.initialMessage) {
      this.result = this.options.initialMessage;
    }

    makeAutoBindThis(this);
    makeObservable(this);
  }

  /**
   * 打开链接
   * @param url
   */
  async open(
    url: string | URL,
    options?: {
      method?: EventStreamOptions['method'];
      body?: EventStreamOptions['body'];
    }
  ): Promise<Result> {
    if (this.loading) {
      throw new Error('正在加载中, 不能重复打开');
    }

    if (this.disposed) {
      throw new Error('已经被销毁, 不能再打开');
    }

    try {
      this.setLoading(true);
      this.setResult('');
      this.setError(undefined);

      return await new Promise<Result>(async (resolve, reject) => {
        const source = (this.eventStream = new EventStream({
          ...options,
          url,
          onMessage: event => {
            if (this.disposed) {
              return;
            }

            const data = event.data as string;

            try {
              if (data === DONE) {
                resolve(this.handleDone());
              } else {
                // FIXME: 这里耦合了 chat 接口协议
                const payload = JSON.parse(data) as ChatCompletion;
                const result = this.result + payload.choices.map(choice => choice.delta.content ?? '').join('');
                this.setResult(result);
              }
            } catch (err) {
              reject(err);
            }
          },
        }));

        try {
          await source.send();
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      this.setError(err as Error);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  dispose() {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    tryDispose(this.eventStream);
  }

  private handleDone() {
    const result = this.options.decode(this.result);

    return result;
  }

  @action
  private setResult(result: string) {
    this.result = result;
  }

  @action
  private setLoading(loading: boolean) {
    this.loading = loading;
  }

  @action
  private setError(error?: Error) {
    this.error = error;
  }
}

export function createIdentityOpenAIEventSourceModel() {
  return new OpenAIEventSourceModel<string>({
    decode: result => result,
  });
}

export function createStaticOpenAIEventSourceModel<Result = any>(message: string, result: Result) {
  return new OpenAIEventSourceModel<Result>({
    initialMessage: message,
    decode: () => result,
  });
}
