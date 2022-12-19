import { Graph } from '@antv/x6';
import memoize from 'lodash/memoize';

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
  key: string | { macos: string; other: string };

  /**
   * 处理器
   */
  handler: () => void;
}

//
const MAC_OS_KEY_MAP: Record<string, string> = {
  command: '⌘',
  alt: '⌥',
  option: '⌥',
  ctrl: '⌃',
  shift: '⇧',
};

/**
 * 快捷键处理器
 * mousetrap
 */
export class KeyboardBinding {
  private bound: Map<string, KeyboardBindingDescriptor> = new Map();
  private graph?: Graph;
  private isMacos = /macintosh|mac os x/i.test(window.navigator.userAgent);

  /**
   * 绑定快捷键
   */
  bindKey(options: KeyboardBindingDescriptor) {
    if (this.graph != null) {
      throw new Error('不能在 bind 方法调用之后绑定快捷键');
    }

    this.bound.set(options.name, options);

    return this;
  }

  bindGraph(graph: Graph) {
    this.graph = graph;

    for (const desc of this.bound.values()) {
      const { handler } = desc;
      const finalKey = this.getBindingKey(desc);

      graph.bindKey(finalKey, e => {
        e.preventDefault();
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

    const readableKey = this.getReadableKey(key);
    const { title, description } = desc;

    return {
      name,
      title,
      description,
      key: readableKey,
      handler: desc.handler,
    };
  }

  private getBindingKey(desc: KeyboardBindingDescriptor) {
    const { key } = desc;
    let finalKey: string;
    if (typeof key === 'object') {
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
        if (this.isMacos && k in MAC_OS_KEY_MAP) {
          return MAC_OS_KEY_MAP[k];
        }

        return k;
      })
      .join(' + ');
  });
}
