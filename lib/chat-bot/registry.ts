import { NamedRegistry } from '@wakeapp/utils';
import type { Extension } from './protocol';
import type { BotModel } from './BotModel';

/**
 * 消息错误处理
 * 返回 false 表示阻止默认行为， 即不需要任何处理
 */
export type MessageErrorHandler = (context: {
  error: Error;
  bot: BotModel;
  userMessageId: string;
  responseMessageId: string;
}) => boolean;

const messageErrorHandler: MessageErrorHandler[] = [];

/**
 * 扩展注册器
 */
export const registry = new NamedRegistry<Extension>();

export function registerExtension(extension: Extension) {
  return registry.register(extension.key, extension) as () => void;
}

export function getExtension(key: string) {
  return registry.registered(key);
}

export function registerMessageErrorHandler(h: MessageErrorHandler): () => void {
  messageErrorHandler.push(h);
  return () => {
    const index = messageErrorHandler.indexOf(h);
    if (index > -1) {
      messageErrorHandler.splice(index, 1);
    }
  };
}

/**
 * 处理错误信息
 * @param context
 * @returns
 */
export const handleMessageError: MessageErrorHandler = context => {
  if (messageErrorHandler.length) {
    for (const handler of messageErrorHandler) {
      const notPreventDefault = handler(context);

      if (notPreventDefault === false) {
        return false;
      }
    }
  }

  return true;
};
