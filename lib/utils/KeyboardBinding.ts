import memoize from 'lodash/memoize';
import { IDisposable } from './IDisposable';

import { OTHER_KEY_MAP, MAC_OS_KEY_MAP } from '@/lib/contants';

export interface KeyboardBindingDescriptor {
  /**
   * 功能名称
   */
  name: string;

  /**
   * 功能标题
   */
  title: string;

  /**
   * 功能描述
   */
  description?: string;

  /**
   * 快捷键
   */
  key: string | string[] | { macos: string | string[]; other: string | string[] };

  /**
   * 处理器
   */
  handler: () => void;
}

export interface KeyboardBindingRegistry {
  bind(key: string | string[], handler: (event: KeyboardEvent) => void): void;

  /**
   * 移除绑定
   * @param key
   */
  unbind(key: string | string[]): void;

  /**
   * 移除所有绑定
   */
  unbindAll(): void;

  /**
   * 决定是否开启快捷键触发
   * @returns
   */
  guard?: () => boolean;
}

const NOOP_GUARD = () => true;

/**
 * 快捷键处理器
 * mousetrap
 */
export class KeyboardBinding implements IDisposable {
  private bound: Map<string, KeyboardBindingDescriptor> = new Map();
  private registry?: KeyboardBindingRegistry;
  private isMacos = /macintosh|mac os x/i.test(window.navigator.userAgent);

  /**
   * 绑定快捷键
   * mousetrap
   */
  bindKey(options: KeyboardBindingDescriptor) {
    if (this.registry != null) {
      throw new Error('不能在 bind 方法调用之后绑定快捷键');
    }

    this.bound.set(options.name, options);

    return this;
  }

  unbindKey(name: string) {
    const bound = this.bound.get(name);
    if (bound) {
      const key = this.getBindingKey(bound);
      this.registry?.unbind(key);
    }
  }

  bindRegistry(registry: KeyboardBindingRegistry) {
    this.registry = registry;

    for (const desc of this.bound.values()) {
      const { handler } = desc;
      const finalKey = this.getBindingKey(desc);

      registry.bind(finalKey, e => {
        if (!(this.registry?.guard ?? NOOP_GUARD)()) {
          return;
        }

        if (e?.preventDefault) {
          e.preventDefault();
        }
        handler();
      });
    }
  }

  /**
   * 获取可读性更高的键盘绑定描述
   * @param name
   */
  getReadableKeyBinding(name: string) {
    const desc = this.bound.get(name);

    if (desc == null) {
      throw new Error(`${name} not found`);
    }

    const key = this.getBindingKey(desc);

    const readableKey = this.getReadableKey(Array.isArray(key) ? key[0] : key);
    const { title, description } = desc;

    return {
      name,
      title,
      description,
      key: readableKey,
      handler: desc.handler,
    };
  }

  /**
   * 释放
   */
  dispose() {
    this.registry?.unbindAll();
  }

  /**
   * 触发处理器
   * @param name
   */
  trigger(name: string) {
    this.bound.get(name)?.handler();
  }

  private getBindingKey(desc: KeyboardBindingDescriptor) {
    const { key } = desc;
    let finalKey: string | string[];
    if (typeof key === 'object' && !Array.isArray(key)) {
      if (this.isMacos) {
        finalKey = key.macos;
      } else {
        finalKey = key.other;
      }
    } else {
      finalKey = key;
    }

    return finalKey;
  }

  private getReadableKey = memoize((key: string) => {
    return key
      .split('+')
      .map(i => {
        const k = i.trim();
        if (this.isMacos) {
          if (k in MAC_OS_KEY_MAP) {
            return MAC_OS_KEY_MAP[k];
          }
        } else if (k in OTHER_KEY_MAP) {
          return OTHER_KEY_MAP[k];
        }

        return k;
      })
      .join(' + ');
  });
}
