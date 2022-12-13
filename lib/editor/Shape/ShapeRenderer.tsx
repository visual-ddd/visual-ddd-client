import { NoopArray, NoopObject } from '@wakeapp/utils';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { BaseNode, useEditorStore } from '../Model';
import { shapes } from './store';
import { ShapeComponentCellProps } from './types';

export interface ShapeRendererProps {
  model: BaseNode;
}

const NoopProps = () => NoopObject;
const MaybeNullProps: (keyof ShapeComponentCellProps)[] = ['position', 'size', 'zIndex'];

const ShapeList = observer(function ShapeList(props: { list: BaseNode[] }) {
  return (
    <>
      {props.list.map(child => {
        return <ShapeRenderer key={child.id} model={child} />;
      })}
    </>
  );
});

/**
 * 图形渲染器
 */
export const ShapeRenderer = observer(function Shape(props: ShapeRendererProps) {
  const { model } = props;
  const config = shapes.get(model.type)!;
  const store = useEditorStore()!;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialProps = useMemo<Record<string, any>>(config.initialProps ?? NoopProps, NoopArray);

  const cellProps: ShapeComponentCellProps = {
    ...initialProps,
    id: model.id,
    data: model.properties,
    canBeParent: !!config.group,
    children: !!model.children.length && <ShapeList list={model.children} />,
  };

  for (const p of MaybeNullProps) {
    if (p in model.properties) {
      // @ts-expect-error
      cellProps[p] = model.properties[p];
    }
  }

  return config.component({
    cellProps,
    store,
    model,
  });
});
