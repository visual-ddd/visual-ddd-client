import { Edge, Markup } from '@antv/x6';
import { NoopArray, NoopObject } from '@wakeapp/utils';
import { observer } from 'mobx-react';
import { useMemo, createElement } from 'react';

import { BaseNode, useEditorModel } from '../Model';
import { shapes } from './store';
import { ShapeComponentCellProps } from './types';

export interface ShapeRendererProps {
  node: BaseNode;
}

const NoopProps = () => NoopObject;
const MaybeNullProps: (keyof ShapeComponentCellProps)[] = [
  // node
  'position',
  'size',
  'angle',

  // edge
  'target',
  'source',
  // common
  'zIndex',
  'visible',
];

const ShapeList = observer(function ShapeList(props: { list: BaseNode[] }) {
  return (
    <>
      {props.list.map(child => {
        return <ShapeRenderer key={child.id} node={child} />;
      })}
    </>
  );
});

const DefaultLabel: Edge.BaseOptions['defaultLabel'] = {
  markup: Markup.getForeignObjectMarkup(),
  attrs: {
    fo: {
      width: 1,
      height: 1,
    },
  },
};
const Label: Edge.BaseOptions['label'] = {
  position: 0.45,
};

/**
 * 图形渲染器
 */
export const ShapeRenderer = observer(function Shape(props: ShapeRendererProps) {
  const { node } = props;
  const config = shapes.get(node.name)!;
  const { model: editorModel } = useEditorModel();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialProps = useMemo<Record<string, any>>(config.staticProps ?? NoopProps, NoopArray);

  /**
   * 扩展的 edge 属性
   */
  const edgeProps = useMemo(() => {
    // 如果边启用了 react edge label 组件，默认添加将 label 设置为 foreignObject
    if (config.shapeType === 'edge' && config.edgeLabelComponent) {
      return { label: Label, defaultLabel: DefaultLabel };
    }
  }, [config.shapeType, config.edgeLabelComponent]);

  const cellProps: ShapeComponentCellProps = {
    ...edgeProps,
    ...initialProps,
    id: node.id,
    data: node.properties,
    canBeParent: !!config.group,
    children: !!node.children.length && <ShapeList list={node.children} />,
  };

  for (const p of MaybeNullProps) {
    if (p in node.properties) {
      // @ts-expect-error
      cellProps[p] = node.properties[p];
    }
  }

  return createElement(config.component, {
    cellProps,
    model: editorModel,
    node: node,
  });
});
