import { useEffect, useRef } from 'react';
import { Disposer } from '@wakeapp/utils';
import { useDeepEffect, useRefValue } from '@wakeapp/hooks';
import { Cell, Graph } from '@antv/x6';

import { useGraphBinding } from '../GraphBinding';

import { CellBindingProps } from './types';
import { useEventStore, wrapPreventListenerOptions } from '../hooks';

export type CellFactory = (
  props: any,
  graph: Graph
) => {
  instance: any;
  disposer: () => void;
};

const defaultFactory: CellFactory = (props, graph) => {
  const instance = new Cell(props);

  graph.addCell(instance);

  return {
    instance,
    disposer: () => graph.removeCell(instance),
  };
};

const delegateToGraphEvents = [
  'click',
  'dblclick',
  'contextmenu',
  'mousedown',
  'mousemove',
  'mouseup',
  'mouseover',
  'mouseout',
  'mouseenter',
  'mouseleave',
  'mousewheel',
  'highlight',
  'unhighlight',
];

export function useCell<Props extends CellBindingProps>(props: Props, factor?: CellFactory) {
  const eventStore = useEventStore(props);
  const propsRef = useRefValue(props);
  const instanceRef = useRef<Cell>();
  const graphContext = useGraphBinding();
  const { attrs, zIndex, visible, data } = props;

  useEffect(() => {
    const disposers = new Disposer();
    disposers.push(
      graphContext.onGraphReady((graph, helper) => {
        const f = factor ?? defaultFactory;
        const { instance, disposer } = f(propsRef.current, graph);
        const cell = (instanceRef.current = instance as Cell);

        // 订阅事件
        const attachEvent = (name: string, handler: Function) => {
          if (delegateToGraphEvents.includes(name)) {
            // 代理到 graph
            disposers.push(helper.delegateEvent(`cell:${name}`, handler, cell.id));
          } else {
            cell.on(name, handler as any);
          }
        };

        eventStore.listenDelegationChange(attachEvent);

        const delegations = eventStore.getDelegations();
        Object.keys(delegations).forEach(event => {
          attachEvent(event, delegations[event]);
        });

        disposers.push(disposer);
      })
    );

    return disposers.release;
  }, []);

  // 监听属性变动
  useDeepEffect(() => {
    if (attrs != null) {
      instanceRef.current?.setAttrs(attrs, wrapPreventListenerOptions({ deep: true }));
    }
  }, [attrs]);

  useEffect(() => {
    if (zIndex != null) {
      instanceRef.current?.setZIndex(zIndex, wrapPreventListenerOptions({}));
    }
  }, [zIndex]);

  useEffect(() => {
    if (visible != null) {
      instanceRef.current?.setVisible(visible, wrapPreventListenerOptions({}));
    }
  }, [visible]);

  useDeepEffect(() => {
    if (data != null) {
      instanceRef.current?.updateData(data, wrapPreventListenerOptions({}));
    }
  }, [data]);

  return instanceRef;
}
