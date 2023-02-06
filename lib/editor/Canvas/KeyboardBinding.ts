import { Graph } from '@antv/x6';
import { KeyboardBinding } from '@/lib/utils';

/**
 * 快捷键处理器
 */
export class CanvasKeyboardBinding extends KeyboardBinding {
  private keysBound = new Set<string | string[]>();

  bindGraph(graph: Graph) {
    this.bindRegistry({
      bind: (key, handler) => {
        graph.bindKey(key, handler);
        this.keysBound.add(key);
      },
      unbind: key => {
        graph.unbindKey(key);
        this.keysBound.delete(key);
      },
      unbindAll: () => {
        const keys = Array.from(this.keysBound);
        for (const key of keys) {
          graph.unbindKey(key);
        }
        this.keysBound.clear();
      },
    });
  }
}
