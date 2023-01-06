import { Graph } from '@antv/x6';
import { useSyncEffect } from '@/lib/hooks';
import { NoopArray } from '@wakeapp/utils';
import React, { useReducer } from 'react';

export namespace Portal {
  /**
   * 所有 portal 实例
   */
  const portalInstance: Map<string, React.Dispatch<Action>> = new Map();
  const graphMapping: WeakMap<Graph, string> = new WeakMap();

  interface Action {
    type: 'add' | 'remove';
    payload: Partial<Payload>;
  }

  interface Payload {
    id: string;
    portal: React.ReactPortal;
  }

  const reducer = (state: Payload[], action: Action) => {
    const payload = action.payload as Payload;
    switch (action.type) {
      case 'add': {
        const index = state.findIndex(item => item.id === payload.id);
        if (index >= 0) {
          state[index] = payload;
          return [...state];
        }
        return [...state, payload];
      }
      case 'remove': {
        const index = state.findIndex(item => item.id === payload.id);
        if (index >= 0) {
          const result = [...state];
          result.splice(index, 1);
          return result;
        }
        break;
      }
      default: {
        break;
      }
    }
    return state;
  };

  /**
   * 获取连接器
   * @param graph
   */
  export function getConnection(graph: Graph) {
    const instanceId = graphMapping.get(graph);
    if (instanceId == null) {
      return null;
    }

    const dispatch = portalInstance.get(instanceId);

    if (dispatch == null) {
      return null;
    }

    return function connect(id: string, portal: React.ReactPortal) {
      dispatch({ type: 'add', payload: { id, portal } });

      return () => {
        dispatch({ type: 'remove', payload: { id } });
      };
    };
  }

  /**
   * 绑定映射关系
   * @param id
   */
  export function bindGraph(id: string, graph: Graph) {
    graphMapping.set(graph, id);
  }

  export function getProvider(id: string) {
    // eslint-disable-next-line react/display-name
    return function ReactShapePortalProvider() {
      const [items, mutate] = useReducer(reducer, []);

      useSyncEffect(() => {
        portalInstance.set(id, mutate);

        return () => {
          portalInstance.delete(id);
        };
      }, NoopArray);

      // eslint-disable-next-line react/no-children-prop
      return React.createElement(React.Fragment, {
        children: items.map(item => item.portal),
      });
    };
  }
}
