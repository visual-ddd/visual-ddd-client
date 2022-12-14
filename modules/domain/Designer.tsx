import { RectBinding, EdgeBinding, registerX6ReactComponent } from '@/lib/g6-binding';
import { useState } from 'react';
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
  // removable: false,
  dropFactory() {
    return {
      size: { width: 50, height: 50 },
    };
  },
  allowLoopConnect: false,
  allowConnectNodes: ['child'],
  edgeFactory: 'edge',
  initialProps: () => ({
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

defineShape('child-2', {
  group: false,
  dropFactory() {
    return {
      size: { width: 50, height: 50 },
    };
  },
  allowLoopConnect: true,
  allowConnectNodes: ['child'],
  initialProps: () => ({
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
  const [showEdge, setShowEdge] = useState(false);
  const [showCanvas, setShowCanvas] = useState(true);

  return (
    <div>
      <EditorStoreProvider value={store}>
        <ComponentContainer>
          <ComponentItem name="rect" data={{ type: 'rect' }}></ComponentItem>
          <ComponentItem name="child" data={{ type: 'child' }}></ComponentItem>
          <ComponentItem name="child-2" data={{ type: 'child-2' }}></ComponentItem>
        </ComponentContainer>

        <button
          onClick={() => {
            setShowEdge(true);
          }}
        >
          showEdge
        </button>

        <button
          onClick={() => {
            setShowCanvas(v => !v);
          }}
        >
          toggleShowCanvas
        </button>

        <div style={{ width: 500, height: 500 }}>
          {showCanvas && (
            <Canvas>
              {/* <RectBinding
              id="custom1"
              tools={['boundary']}
              size={{ width: 100, height: 100 }}
              position={{ x: 300, y: 300 }}
            />
            <RectBinding
              id="custom2"
              tools={['boundary']}
              size={{ width: 100, height: 100 }}
              position={{ x: 100, y: 300 }}
            />
            {showEdge && <EdgeBinding source="custom1" target="custom2" tools={['boundary']} />} */}
            </Canvas>
          )}
        </div>

        <Operations />
      </EditorStoreProvider>
    </div>
  );
});

export default Designer;
