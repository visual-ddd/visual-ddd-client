import { observer } from 'mobx-react';
import { BaseNode, useEditorStore } from '../Model';
import { shapes } from './store';

export interface ShapeRendererProps {
  model: BaseNode;
}

/**
 * 图形渲染器
 */
export const ShapeRenderer = observer(function Shape(props: ShapeRendererProps) {
  const { model } = props;
  const config = shapes.get(model.type)!;
  const store = useEditorStore()!;

  return config.component({
    cellProps: {
      id: model.id,
      data: model.properties,
      position: model.properties.position,
      size: model.properties.size,
      attrs: model.properties.attrs,
      zIndex: model.properties.zIndex,
      canBeParent: !!config.group,
      children:
        !!model.children.length &&
        model.children.map(child => {
          return <ShapeRenderer key={child.id} model={child} />;
        }),
    },
    store,
    model,
  });
});
