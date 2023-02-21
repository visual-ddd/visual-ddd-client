import React, { memo, useEffect, useId, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { Graph, Cell, EventArgs } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { Transform } from '@antv/x6-plugin-transform';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Scroller } from '@antv/x6-plugin-scroller';
import { MiniMap } from '@antv/x6-plugin-minimap';
import type { Options } from '@antv/x6/lib/graph/options';
import { Noop, NoopArray } from '@wakeapp/utils';
import { useDisposer } from '@wakeapp/hooks';

import {
  CellInstance,
  GraphBindingContextHelper,
  GraphBindingContextValue,
  GraphBindingProvider,
  OnCellReadyListener,
  OnGraphReadyListener,
} from './GraphBindingContext';
import { useEventStore } from '../hooks';
import { Portal } from '../react-shape';

export type GraphBindingOptions = Partial<Options.Manual> & {
  selection?: Selection.Options;
  keyboard?: Keyboard['options'];
  clipboard?: Clipboard.Options;
  resizing?: Transform.Options['resizing'];
  rotating?: Transform.Options['rotating'];
  snapline?: Snapline.Options;
  scroller?: Scroller.Options;
  minimap?: Omit<MiniMap.Options, 'container'>;
};

export interface GraphBindingProps {
  className?: string;
  style?: React.CSSProperties;
  minimapClassName?: string;
  minimapStyle?: React.CSSProperties;

  children?: React.ReactNode;

  /**
   * 画布初始化选项
   */
  options?: GraphBindingOptions;

  /**
   * 画布实例就绪
   * @param graph
   * @returns
   */
  onGraphReady?: (graph: Graph) => void;

  /**
   * 处理组件库拖入
   * @param evt
   * @returns
   */
  onDrop?: (evt: { componentData: Record<string, any>; nativeEvent: React.DragEvent; graph: Graph }) => void;

  /**
   * 鼠标移动事件
   * @param evt
   * @returns
   */
  onMouseMove?: (evt: React.MouseEvent) => void;
  onMouseEnter?: (evt: React.MouseEvent) => void;
  onMouseLeave?: (evt: React.MouseEvent) => void;

  /**
   * 画布缩放
   * @param evt
   * @returns
   */
  onScale?: (evt: EventArgs['scale']) => void;

  /**
   * 开启嵌入，在开始拖动节点时触发
   * @param evt
   * @returns
   */
  onNode$Embed?: (evt: EventArgs['node:embed']) => void;

  /**
   * 寻找目标节点过程中触发
   * @param evt
   * @returns
   */
  onNode$Embedding?: (evt: EventArgs['node:embedding']) => void;

  /**
   * 完成节点嵌入后触发
   */
  onNode$Embedded?: (evt: EventArgs['node:embedded']) => void;

  /**
   * 用户开始拖动节点时触发
   * @param evt
   * @returns
   */
  onNode$Move?: (evt: EventArgs['node:move']) => void;

  /**
   * 拖拽节点中触发
   * @param evt
   * @returns
   */
  onNode$Moving?: (evt: EventArgs['node:moving']) => void;

  /**
   * 用户拖动节点移动后触发
   * @param evt
   * @returns
   */
  onNode$Moved?: (evt: EventArgs['node:moved']) => void;

  /**
   * 节点删除后触发
   * @param evt
   * @returns
   */
  onNode$Removed?: (evt: EventArgs['node:removed']) => void;

  /**
   * 节点位置变更
   */
  onNode$Change$Position?: (evt: EventArgs['node:change:position']) => void;

  /**
   * 节点大小变更
   * @param evt
   * @returns
   */
  onNode$Change$Size?: (evt: EventArgs['node:change:size']) => void;

  /**
   * 节点开始交互resize
   *
   * @note 这个只有交互式调整大小时才会触发，手动设置不会触发
   */
  onNode$Resize?: (evt: EventArgs['node:resize']) => void;

  /**
   * 节点尺寸变更,
   * @note 这个只有交互式调整大小时才会触发，手动设置不会触发
   */
  onNode$Resized?: (evt: EventArgs['node:resized']) => void;

  /**
   * 节点旋转
   */
  onNode$Rotated?: (evt: EventArgs['node:rotated']) => void;

  /**
   * 边连接变更
   * @param evt
   * @returns
   */
  onEdge$Connected?: (evt: EventArgs['edge:connected']) => void;

  /**
   * 边被移除时触发
   * @param evt
   * @returns
   */
  onEdge$Removed?: (evt: EventArgs['edge:removed']) => void;

  /**
   * 边新增时触发
   * @param evt
   * @returns
   */
  onEdge$Added?: (evt: EventArgs['edge:added']) => void;

  /**
   * 边选中时触发
   * @param evt
   * @returns
   */
  onEdge$Selected?: (evt: EventArgs['edge:selected']) => void;

  /**
   * 边取消选中时触发
   * @param evt
   * @returns
   */
  onEdge$Unselected?: (evt: EventArgs['edge:unselected']) => void;

  /**
   * z-index 变动
   * @param evt
   * @returns
   */
  onCell$Change$ZIndex?: (evt: EventArgs['cell:change:zIndex']) => void;

  /**
   * visible 变动
   * @param evt
   * @returns
   */
  onCell$Change$Visible?: (evt: EventArgs['cell:change:visible']) => void;

  /**
   * 节点移除
   */
  onCell$Removed?: (evt: EventArgs['cell:removed']) => void;

  /**
   * 父节点变更
   * @param evt
   * @returns
   */
  onCell$Change$Parent?: (evt: EventArgs['cell:change:parent']) => void;

  /**
   * 子节点变更
   * @param evt
   * @returns
   */
  onCell$Change$Children?: (evt: EventArgs['cell:change:children']) => void;

  /**
   * 选择变动
   */
  onSelection$Changed?: (evt: EventArgs['selection:changed']) => void;
}

export { useGraphBinding } from './GraphBindingContext';

export const ALLOWED_DROP_SOURCE = '__from-component__';

const N = Noop;

/**
 * 画布
 */
export const GraphBinding = memo((props: GraphBindingProps) => {
  const {
    className,
    style,
    minimapClassName,
    minimapStyle,
    children,
    options,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
    onGraphReady,
    onDrop,
    ...other
  } = props;
  const id = useId();
  const disposer = useDisposer();
  const eventStore = useEventStore(other);
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph>();
  const ReactPortalProvider = useMemo(() => {
    return Portal.getProvider(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const contextValue = useMemo(() => {
    let graphReadyListeners: OnGraphReadyListener[] = [];
    const cellReadyListeners: [OnCellReadyListener, string | undefined][] = [];
    const cellDestroyedListeners: [OnCellReadyListener, string | undefined][] = [];
    const cells: Map<string, Cell> = new Map();

    let graph: Graph;
    let recycleBind: Map<string, { instance: CellInstance; createDate: number }> = new Map();
    let disposed = false;

    type EventName = string;
    type CellID = string;
    const eventListeners: Map<EventName, Map<CellID, Function>> = new Map();
    const KEEP_ALIVE_TIMEOUT = 300;

    // 销毁节点回收
    disposer.push(() => {
      console.log('graph clear');
      disposed = true;
      recycleBind.clear();
    });

    const gc = () => {
      if (disposed) {
        return;
      }

      setTimeout(() => {
        const now = Date.now();
        const keysToRemove: string[] = [];

        for (const [key, instance] of recycleBind.entries()) {
          // 10s 过期回收
          if (now - instance.createDate >= KEEP_ALIVE_TIMEOUT) {
            // 回收
            keysToRemove.push(key);
          }
        }

        if (keysToRemove.length) {
          for (const key of keysToRemove) {
            // 触发销毁
            recycleBind.get(key)?.instance.disposer();
            // 移除
            recycleBind.delete(key);
          }
        }

        if (recycleBind.size) {
          // 继续调度
          gc();
        }
      }, KEEP_ALIVE_TIMEOUT);
    };

    const setCellVisible = (id: string, visible: boolean) => {
      const elements = document.querySelectorAll(`[data-cell-id="${id}"]`);
      if (elements.length) {
        for (const e of elements) {
          (e as SVGGElement).style.display = `${visible ? 'unset' : 'none'}`;
        }
      }
    };

    const helper: GraphBindingContextHelper = {
      created(cell) {
        cells.set(cell.id, cell);
        for (const [listener, watchId] of cellReadyListeners) {
          if (watchId != null && watchId !== cell.id) {
            continue;
          }

          listener(cell);
        }
      },
      destroyed(cell) {
        cells.delete(cell.id);
        for (const [listener, watchId] of cellDestroyedListeners) {
          if (watchId != null && watchId !== cell.id) {
            continue;
          }

          listener(cell);
        }
      },
      delegateEvent(eventName, handler, cellId) {
        if (!eventListeners.has(eventName)) {
          const list = new Map();
          eventListeners.set(eventName, list);
          // listen to graph
          graph.on(eventName, (evt: { cell: Cell }) => {
            const id = evt.cell.id;
            const handler = list.get(id);
            handler?.(evt);
          });
        }

        const list = eventListeners.get(eventName)!;
        list.set(cellId, handler);

        return () => {
          list.delete(cellId);
        };
      },
      recycle(id: string, instance) {
        if (!recycleBind.size) {
          // 垃圾回收调度
          gc();
        }

        recycleBind.set(id, { instance, createDate: Date.now() });

        // 隐藏
        setCellVisible(id, false);
      },
      reuse(id) {
        const item = recycleBind.get(id);

        if (item != null) {
          recycleBind.delete(id);

          // 显示
          setCellVisible(id, true);

          const instance = item.instance.instance;

          // 已被移除 model, 这种情况下基本渲染不出来，直接销毁
          if (instance.model == null) {
            item.instance.disposer();

            return null;
          }

          return item.instance as any;
        }

        return null;
      },
    };

    return {
      onGraphReady(listener) {
        // 已初始化
        if (graph) {
          requestAnimationFrame(() => {
            listener(graph, helper);
          });

          // FIXME: 为什么不能使用 Noop
          return N;
        }

        graphReadyListeners.push(listener);

        return () => {
          const idx = graphReadyListeners.indexOf(listener);
          if (idx !== -1) {
            graphReadyListeners.splice(idx, 1);
          }
        };
      },
      onCellReady(listener, watchId) {
        if (watchId != null && cells.has(watchId)) {
          // 已存在，立即调用
          listener(cells.get(watchId)!);
        }

        cellReadyListeners.push([listener, watchId]);

        return () => {
          const idx = cellReadyListeners.findIndex(([l]) => l === listener);
          if (idx !== -1) {
            cellReadyListeners.splice(idx, 1);
          }
        };
      },
      onCellDestroyed(listener, watchId) {
        cellDestroyedListeners.push([listener, watchId]);

        return () => {
          const idx = cellDestroyedListeners.findIndex(([l]) => l === listener);
          if (idx !== -1) {
            cellDestroyedListeners.splice(idx, 1);
          }
        };
      },
      // @ts-expect-error
      __emitGraph(g: Graph) {
        graph = g;
        const l = graphReadyListeners;
        graphReadyListeners = NoopArray;
        for (const i of l) {
          i(g, helper);
        }
      },
    } satisfies GraphBindingContextValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, NoopArray);

  const handleDragOver = (evt: React.DragEvent) => {
    evt.preventDefault();
    if (
      evt.dataTransfer.dropEffect !== 'copy' &&
      evt.dataTransfer.getData('text/plain').startsWith(ALLOWED_DROP_SOURCE)
    ) {
      evt.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (evt: React.DragEvent) => {
    const data = JSON.parse(evt.dataTransfer.getData('text/plain').slice(ALLOWED_DROP_SOURCE.length));
    evt.persist();
    onDrop?.({ componentData: data, nativeEvent: evt, graph: graphRef.current! });
  };

  useEffect(() => {
    const container = containerRef.current!;

    const graph = new Graph({
      container: container,
      ...options,
    });

    // 插件加载
    {
      if (options?.selection) {
        graph.use(new Selection(options.selection));
      }

      if (options?.keyboard) {
        graph.use(new Keyboard(options.keyboard));
      }

      if (options?.clipboard) {
        graph.use(new Clipboard(options.clipboard));
      }

      if (options?.resizing != null || options?.rotating != null) {
        graph.use(
          new Transform({
            resizing: options.resizing,
            rotating: options.rotating,
          })
        );
      }

      if (options?.snapline) {
        graph.use(new Snapline(options.snapline));
      }

      if (options?.scroller) {
        graph.use(new Scroller(options.scroller));
      }

      if (options?.minimap) {
        graph.use(
          new MiniMap({
            container: minimapRef.current!,
            ...options.minimap,
          })
        );
      }
    }

    // 通知就绪
    {
      Portal.bindGraph(id, graph);
      onGraphReady?.(graph);
      graphRef.current = graph;

      requestAnimationFrame(() => {
        contextValue.__emitGraph(graph);
      });
    }

    // 事件处理
    {
      const attachEvent = (name: string, handler: Function) => {
        graph.on(name, handler as any);
      };

      eventStore.listenDelegationChange(attachEvent);

      const delegations = eventStore.getDelegations();
      Object.keys(delegations).forEach(event => {
        attachEvent(event, delegations[event]);
      });
    }

    return () => {
      graph.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className={classNames('vd-graph-binding', className)}
        style={style}
        data-id={id}
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <GraphBindingProvider value={contextValue}>
          <ReactPortalProvider />
          {children}
        </GraphBindingProvider>
      </div>
      {!!options?.minimap && (
        <div
          className={classNames('vd-graph-binding__minimap', minimapClassName)}
          style={minimapStyle}
          ref={minimapRef}
        ></div>
      )}
    </>
  );
});

GraphBinding.displayName = 'GraphBinding';
