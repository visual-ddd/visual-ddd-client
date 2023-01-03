import { RectBinding } from '@/lib/g6-binding';
import { Input } from 'antd';
import { observer } from 'mobx-react';
import { EditorFormContainer, EditorFormItem } from '../../components';
import { defineShape } from '../defineShape';
import { useHoverShowPorts } from '../hooks';

import icon from './activity.png';

defineShape({
  name: 'activity',
  title: '业务活动',
  shapeType: 'node',
  description: '业务活动',
  icon,
  group: false,
  allowLoopConnect: false,
  allowConnectNodes: ['activity'],
  resizing: { minHeight: 70, maxHeight: 200, minWidth: 120, maxWidth: 400 },
  initialProps() {
    return {
      label: '业务活动',
      size: {
        height: 70,
        width: 120,
      },
    };
  },
  staticProps: () => ({
    zIndex: 2,
    attrs: {},
    ports: {
      groups: {
        left: {
          position: 'left',
          attrs: { circle: { magnet: true, r: 5 } },
        },
        right: {
          position: 'right',
          label: {
            position: 'right',
          },
          attrs: { circle: { magnet: true, r: 5 } },
        },
      },
      items: [
        { id: 'left', group: 'left' },
        { id: 'right', group: 'right' },
      ],
    },
  }),
  component: observer(props => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const hoverHandlers = useHoverShowPorts();

    return <RectBinding label={props.node.getProperty('label')} {...props.cellProps} {...hoverHandlers} />;
  }),
  attributeComponent() {
    return (
      <EditorFormContainer>
        <EditorFormItem path="label" label="内容">
          <Input.TextArea placeholder="请输入内容"></Input.TextArea>
        </EditorFormItem>
      </EditorFormContainer>
    );
  },
});
