import { NamedRegistry } from '@wakeapp/utils';
import { Extension } from './protocol';

/**
 * 扩展注册器
 */

export const registry = new NamedRegistry<Extension>();

export function registerExtension(extension: Extension) {
  return registry.register(extension.key, extension);
}

export function getExtension(key: string) {
  return registry.registered(key);
}
