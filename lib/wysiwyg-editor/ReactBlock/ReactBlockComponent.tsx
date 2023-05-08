import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { ReactBlockRegistry } from './registry';
import s from './ReactBlockComponent.module.scss';

export const ReactBlockComponent = (props: NodeViewProps) => {
  const attrs = props.node.attrs as { name: string; state: any };
  const component = ReactBlockRegistry.registered(attrs.name);

  if (!component) {
    return (
      <NodeViewWrapper className={s.root}>
        <div className={s.error}>组件 {attrs.name} 未注册</div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className={'react-block'}>
      {component.render(attrs.state, newState => {
        props.updateAttributes({
          state: { ...attrs.state, ...newState },
        });
      })}
    </NodeViewWrapper>
  );
};
