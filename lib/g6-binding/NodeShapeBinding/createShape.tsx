import { CellContextProvider } from '../CellBinding/context';

import { CellFactory } from '../CellBinding/useCell';
import { wrapPreventListenerOptions } from '../hooks';
import { NodeBindingProps } from '../NodeBinding';
import { NodeUpdater, useNode } from '../NodeBinding/useNode';

export function createShape<Props extends NodeBindingProps>(
  Shape: any,
  properties: Array<{ name: string; getter: string; setter: string; remover?: string }>,
  name: string
) {
  const factory: CellFactory = (props, graph) => {
    const instance = new Shape(props);
    graph.addNode(instance);

    return {
      instance,
      disposer: () => {
        console.log('real dispose');
        graph.removeNode(instance);
      },
    };
  };

  class CustomShapeUpdater extends NodeUpdater {
    accept(props: Record<string, any>): void {
      super.accept(props);
      for (const { name } of properties) {
        this.doUpdate(name, props[name], { object: props });
      }
    }
  }

  for (const { name, getter, setter, remover } of properties) {
    Object.defineProperty(CustomShapeUpdater.prototype, name, {
      get: function () {
        return this.instance.current?.[getter]();
      },
      set: function (value: any) {
        if (remover && value === undefined) {
          // 清理函数
          (this.instance.current as any)?.[remover](wrapPreventListenerOptions({}));
          return;
        }

        (this.instance.current as any)?.[setter](value, wrapPreventListenerOptions({}));
      },
    });
  }

  function Comp(props: Props) {
    const { canBeParent = true } = props;
    const { contextValue } = useNode({
      props,
      factory,
      canBeParent,
      PropertyUpdater: CustomShapeUpdater as typeof NodeUpdater,
    });

    if (canBeParent) {
      return <CellContextProvider value={contextValue}>{props.children}</CellContextProvider>;
    } else {
      return null;
    }
  }

  Comp.displayName = name;

  return Comp;
}
