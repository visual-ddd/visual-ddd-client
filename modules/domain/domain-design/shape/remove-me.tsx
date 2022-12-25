import { Input, InputNumber } from 'antd';
import { FC } from 'react';
import { ReactComponentBinding, ReactComponentProps, RectBinding, registerReactComponent } from '@/lib/g6-binding';
import { defineShape, useHoverShowPorts, useShapeModel, EditorFormItem, FormRuleReportType } from '@/lib/editor';
import { EditorFormContainer } from '@/lib/editor/components/Form/FormContainer';

const MyComponent: FC<ReactComponentProps> = props => {
  const { properties, updateProperty } = useShapeModel(props.node);
  return (
    <div
      onClick={() => updateProperty('count', properties.count + 1)}
      style={{ background: 'green', width: '100%', height: '100%', whiteSpace: 'nowrap' }}
    >
      hello {properties.count}
    </div>
  );
};
MyComponent.displayName = 'MyComponent';

registerReactComponent('hello', MyComponent);

defineShape({
  name: 'react',
  title: 'React 组件',
  shapeType: 'node',
  initialProps() {
    return {
      size: { width: 100, height: 100 },
      count: 9,
    };
  },
  component(props) {
    return <ReactComponentBinding {...props.cellProps} component="hello" />;
  },
  rules: {
    fields: {
      count: {
        $self: {
          type: 'number',
          max: 10,
          reportType: FormRuleReportType.Warning,
        },
      },
      name: {
        $self: [
          { required: true },
          {
            validator: async (value: string, context) => {
              if (!value) {
                return;
              }

              const count = context.model.getProperty('count');
              if (value.length < count) {
                throw new Error(`长度不能低于 ${count}`);
              }
            },
          },
        ],
      },
    },
  },
  attributeComponent(props) {
    return (
      <>
        <EditorFormContainer>
          <EditorFormItem path="count" label="计数" tooltip="很重要">
            <InputNumber />
          </EditorFormItem>
          <EditorFormItem path="name" label="名称" dependencies="count">
            <Input />
          </EditorFormItem>
        </EditorFormContainer>
      </>
    );
  },
});

defineShape({
  name: 'rect',
  shapeType: 'node',
  title: '大分组',
  group: true,
  autoResizeGroup: 20,
  initialProps: () => {
    return { label: 'Hello' };
  },
  droppable: ctx => {
    return ctx.sourceType !== 'rect';
  },
  embeddable: ctx => {
    return ctx.childModel?.name !== 'rect';
  },
  dropFactory() {
    return { size: { width: 300, height: 300 }, zIndex: 1 };
  },
  copyFactory({ properties }) {
    return { label: properties.label + '+' };
  },
  component(props) {
    return (
      <RectBinding
        {...props.cellProps}
        onClick={() => {
          props.model.commandHandler.updateNodeProperty({
            node: props.node,
            path: 'label',
            value: String(Math.random()),
          });
        }}
        label={props.node.properties.label}
      />
    );
  },
});

defineShape({
  name: 'rect-child',
  title: '小分组',
  shapeType: 'node',
  group: true,
  autoResizeGroup: 20,
  droppable: ctx => {
    return ctx.sourceType !== 'rect';
  },
  embeddable: ctx => {
    return ctx.childModel?.name !== 'rect';
  },
  staticProps() {
    return { size: { width: 200, height: 200 }, zIndex: 1 };
  },
  component(props) {
    return <RectBinding {...props.cellProps} />;
  },
});

defineShape({
  name: 'child',
  title: '子节点1',
  group: false,
  shapeType: 'node',
  rotating: 20,
  resizing: { minHeight: 50, maxHeight: 100 },
  // removable: false,
  dropFactory() {
    return {
      size: { width: 50, height: 50 },
    };
  },
  allowLoopConnect: false,
  allowConnectNodes: ['child'],
  edgeFactory: 'edge',
  staticProps: () => ({
    zIndex: 2,
    tools: ['boundary'],
    attrs: {
      body: {
        fill: 'red',
      },
    },
    ports: {
      groups: {
        left: {
          position: 'left',
          attrs: { text: { text: 'ok' }, circle: { magnet: true, r: 5 } },
        },
        right: {
          position: 'right',
          label: {
            position: 'right',
          },
          attrs: { text: { text: 'ok' }, circle: { magnet: true, r: 5 } },
        },
      },
      items: [
        { id: 'left', group: 'left' },
        { id: 'right', group: 'right' },
      ],
    },
  }),
  component(props) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const hoverHandlers = useHoverShowPorts();

    return <RectBinding {...props.cellProps} {...hoverHandlers} />;
  },
});

defineShape({
  name: 'child-2',
  title: '子节点2',
  group: false,
  shapeType: 'node',
  dropFactory() {
    return {
      size: { width: 50, height: 50 },
    };
  },
  allowLoopConnect: true,
  allowConnectNodes: ['child'],
  staticProps: () => ({
    zIndex: 2,
    attrs: {
      body: {
        fill: 'blue',
        magnet: true,
      },
    },
  }),
  component(props) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const hoverHandlers = useHoverShowPorts();

    return (
      <RectBinding
        onClick={() => {
          props.model;
        }}
        {...props.cellProps}
        {...hoverHandlers}
      />
    );
  },
});