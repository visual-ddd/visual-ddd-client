import { action, makeObservable, observable } from 'mobx';
import { makeAutoBindThis } from '@/lib/store';
import { IDisposable, TimeoutController, tryDispose } from '@/lib/utils';
import { EventStream, EventStreamOptions } from './stream';

const TIMEOUT = 60 * 1000;

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

    const timeoutController = new TimeoutController(TIMEOUT);

    const ending = () => {
      this.setLoading(false);
      timeoutController.dispose();
    };

    try {
      this.setLoading(true);
      this.setResult('');
      this.setError(undefined);

      return await Promise.race([
        timeoutController.start(),
        new Promise<Result>(async (resolve, reject) => {
          const source = (this.eventStream = new EventStream({
            ...options,
            url,
            onDone: () => {
              if (this.disposed) {
                return;
              }

              resolve(this.handleDone());
            },

            onMessage: event => {
              if (this.disposed) {
                return;
              }

              timeoutController.refresh();

              const result = this.result + event;
              this.setResult(result);
            },
          }));

          try {
            await source.send();
          } catch (err) {
            reject(err);
          } finally {
            ending();
          }
        }),
      ]);
    } catch (err) {
      this.setError(err as Error);
      throw err;
    } finally {
      ending();
    }
  }

  dispose = () => {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    tryDispose(this.eventStream);
  };

  private handleDone() {
    const result = this.options.decode(this.result);

    return result;
  }

  @action
  setResult(result: string) {
    this.result = result;
  }

  @action
  setLoading(loading: boolean) {
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
