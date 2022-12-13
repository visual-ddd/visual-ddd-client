import { RectBinding, registerX6ReactComponent } from '@/lib/g6-binding';
import { useState, FC } from 'react';
import {
  ComponentContainer,
  ComponentItem,
  EditorStoreProvider,
  BaseEditorStore,
  Canvas,
  BaseNode,
  defineShape,
  useHoverShowPorts,
} from '@/lib/editor';
import { observer } from 'mobx-react';

function MyComponent() {
  const [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(i => i + 1)} style={{ background: 'red', width: 200 }}>
      hello world {count}
    </div>
  );
}

registerX6ReactComponent('hello', MyComponent);

defineShape('rect', {
  group: true,
  droppable: ctx => {
    return ctx.sourceType !== 'rect';
  },
  embeddable: ctx => {
    return ctx.childModel?.type !== 'rect';
  },
  dropFactory() {
    return { size: { width: 300, height: 300 }, zIndex: 1 };
  },
  component(props) {
    return <RectBinding {...props.cellProps} />;
  },
});

defineShape('child', {
  group: false,
  removable: false,
  dropFactory() {
    return {
      size: { width: 50, height: 50 },
    };
  },
  initialProps: () => ({
    zIndex: 2,
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

const store = new BaseEditorStore();

const Operations = observer(() => {
  return (
    <div>
      <div>selected: {store.selectedNodes.map(n => n.id).join(', ')}</div>
      <div>focusing: {store.focusingNode?.id}</div>

      <button onClick={store.removeSelected}>移除选中</button>
      <button
        onClick={() => {
          if (store.focusingNode) {
            store.removeNode({ node: store.focusingNode });
          }
        }}
      >
        移除focusing
      </button>
    </div>
  );
});

const Designer = observer(() => {
  return (
    <div>
      <EditorStoreProvider value={store}>
        <ComponentContainer>
          <ComponentItem name="rect" data={{ type: 'rect' }}></ComponentItem>
          <ComponentItem name="child" data={{ type: 'child' }}></ComponentItem>
        </ComponentContainer>

        <div style={{ width: 500, height: 500 }}>
          <Canvas></Canvas>
        </div>

        <Operations />
      </EditorStoreProvider>
    </div>
  );
});

export default Designer;
