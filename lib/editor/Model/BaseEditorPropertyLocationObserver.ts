import { DisposerFunction } from '@/lib/core';
import { getPaths, normalizePaths } from '@/lib/utils';

/**
 * 定位信息
 */
export interface EditorPropertyLocation {
  /**
   * 节点 ID
   */
  nodeId: string;

  /**
   * 字段路径
   */
  path?: string;

  /**
   * 附加信息
   */
  reason?: string;
}

// 匿名订阅标识符
const ANONYMOUS = '';

export interface EditorPropertyLocationEvent extends EditorPropertyLocation {
  /**
   * 订阅者当前的位置
   */
  currentPath?: string;

  /**
   * 已处理该定位
   * @returns
   */
  resolve: () => void;
}

export type EditorPropertyLocationListener = (evt: EditorPropertyLocationEvent) => void;

type NodeId = string;
type Path = string;
type Resolved = boolean;

/**
 * 用于实现编辑器字段定位
 */
export class BaseEditorPropertyLocationObserver {
  private location: EditorPropertyLocation | undefined;
  private subscriber: Map<NodeId, Map<Path, EditorPropertyLocationListener[]>> = new Map();

  /**
   * 定位节点
   * @param params
   * @returns 返回 true 表示已经处理
   */
  emit(params: EditorPropertyLocation): Resolved {
    const location = this.setLocation(params);
    const { nodeId, path } = location;

    const node = this.subscriber.get(nodeId);

    if (node == null || !node.size) {
      // 没有订阅者，尝试调用匿名订阅者
      return this.callAnonymous(params);
    }

    const finalPath = path || ANONYMOUS;

    const currentPath = getPaths(finalPath).slice(0);

    while (currentPath.length) {
      if (this.call(params, node, currentPath.join('.'))) {
        return true;
      }

      currentPath.pop();
    }

    // 节点匹配
    if (this.call(params, node, ANONYMOUS)) {
      return true;
    }

    // 匿名匹配
    return this.callAnonymous(params);
  }

  /**
   * 获取当前的位置
   */
  peek(): EditorPropertyLocation | undefined {
    return this.location;
  }

  /**
   * 判断是否满足当前定位的条件
   *
   * - 完全匹配
   * - 父级匹配, 比如定位为 1.2.3，如果给定路径 1.2，则会匹配
   *
   * @param nodeId
   * @param path
   */
  satisfy(nodeId: string, path?: string): boolean {
    if (this.location == null) {
      return false;
    }

    if (nodeId !== this.location.nodeId) {
      return false;
    }

    // 直接节点匹配
    if (!path) {
      return true;
    }

    // 仅节点定位, 已经给出了详细的匹配路径，因此是无法匹配到的
    if (!this.location.path) {
      return false;
    }

    const normalizedPath = normalizePaths(path);

    return this.location.path.startsWith(normalizedPath);
  }

  /**
   * 表示定位已经处理
   */
  resolve = (): void => {
    this.location = undefined;
  };

  isResolved(): boolean {
    return this.location == null;
  }

  /**
   * 匿名订阅
   * @param listener
   * @returns
   */
  subscribeAnonymous(listener: EditorPropertyLocationListener): DisposerFunction {
    return this.subscribe(undefined, undefined, listener);
  }

  /**
   * 订阅节点
   * @param nodeId
   * @param listener
   * @returns
   */
  subscribeNode(nodeId: string, listener: EditorPropertyLocationListener): DisposerFunction {
    return this.subscribe(nodeId, undefined, listener);
  }

  /**
   * 节点 + 路径订阅
   * @param nodeId
   * @param path
   * @param listener
   * @returns
   */
  subscribePath(nodeId: string, path: string, listener: EditorPropertyLocationListener): DisposerFunction {
    return this.subscribe(nodeId, path, listener);
  }

  /**
   * 订阅定位
   * @param nodeId 节点 id, 如果 nodeId 为空，则表示监听所有
   * @param path 路径，以这个为前缀的路径都会触发回调, 可选，如果为空，则表示定义节点
   * @param callback
   */
  subscribe(
    nodeId: string | undefined,
    path: string | undefined,
    listener: EditorPropertyLocationListener
  ): DisposerFunction {
    nodeId = nodeId || ANONYMOUS;
    path = normalizePaths(path || ANONYMOUS);

    let node = this.subscriber.get(nodeId);
    if (node == null) {
      node = new Map();
      this.subscriber.set(nodeId, node);
    }

    let listeners = node.get(path);
    if (listeners == null) {
      listeners = [];
      node.set(path, listeners);
    }

    listeners.push(listener);

    return () => {
      const idx = listeners!.indexOf(listener);
      if (idx !== -1) {
        // 清理队列
        listeners!.splice(idx, 1);

        // 清理列表
        if (!listeners?.length) {
          node?.delete(path!);
        }

        // 清理 map
        if (!node?.size) {
          this.subscriber.delete(nodeId!);
        }
      }
    };
  }

  private setLocation(params: EditorPropertyLocation) {
    return (this.location = { ...params, path: params.path && normalizePaths(params.path) });
  }

  /**
   * 调用全局匿名订阅者
   * @param location
   * @returns
   */
  private callAnonymous(location: EditorPropertyLocation): Resolved {
    const map = this.subscriber.get(ANONYMOUS);
    if (map) {
      return this.call(location, map, ANONYMOUS);
    }

    return false;
  }

  private call(
    location: EditorPropertyLocation,
    map: Map<Path, EditorPropertyLocationListener[]>,
    path: string
  ): Resolved {
    const listeners = map.get(path);
    if (listeners?.length) {
      for (const i of listeners) {
        i({
          ...location,
          currentPath: path || ANONYMOUS,
          resolve: this.resolve,
        });

        if (this.isResolved()) {
          return true;
        }
      }
    }

    return false;
  }
}
