import { ReactComponentBinding, registerReactComponent } from '@/lib/g6-binding';
import { Input } from 'antd';
import classNames from 'classnames';
import { EditorFormContainer, EditorFormItem } from '../../components';
import { defineShape } from '../defineShape';
import { useShapeModel } from '../hooks';

import icon from './comment.png';

import s from './comment.module.scss';

registerReactComponent('comment', props => {
  const properties = useShapeModel(props.node).properties as unknown as { content: string };

  return <div className={classNames('vd-shape-comment', s.root)}>{properties.content}</div>;
});

defineShape({
  name: 'comment',
  title: '注释',
  shapeType: 'node',
  description: '注释',
  resizing: true,
  icon,
  group: false,
  initialProps() {
    return {
      size: {
        width: 150,
        height: 120,
      },
      __prevent_auto_resize__: true,
      content: '注释内容',
    };
  },
  staticProps: () => ({
    zIndex: 2,
    attrs: {},
  }),
  component: props => {
    return <ReactComponentBinding {...props.cellProps} component="comment" />;
  },
  attributeComponent() {
    return (
      <EditorFormContainer>
        <EditorFormItem path="content" label="注释">
          <Input.TextArea placeholder="请输入注释内容" autoSize={{ minRows: 3, maxRows: 20 }}></Input.TextArea>
        </EditorFormItem>
      </EditorFormContainer>
    );
  },
});
