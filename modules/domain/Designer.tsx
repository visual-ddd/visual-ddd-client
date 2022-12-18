import { Doc as YDoc } from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
// import { IndexeddbPersistence } from 'y-indexeddb';
import { observer } from 'mobx-react';
import { useState, FC } from 'react';
import {
  NodeBBox,
  ReactComponentBinding,
  ReactComponentProps,
  RectBinding,
  registerReactComponent,
} from '@/lib/g6-binding';
import {
  ComponentContainer,
  ComponentItem,
  EditorModelProvider,
  Canvas,
  CanvasModelProvider,
  defineShape,
  useHoverShowPorts,
  BaseEditorModel,
  useCanvasModel,
} from '@/lib/editor';

const MyComponent: FC<ReactComponentProps> = props => {
  const [count, setCount] = useState('0');
  return (
    <div
      onClick={() => setCount(i => i + '0')}
      style={{ background: 'green', width: '100%', height: '100%', whiteSpace: 'nowrap' }}
    >
      hello {count}
    </div>
  );
};

registerReactComponent('hello', MyComponent);

defineShape('react', {
  shapeType: 'node',
  initialProps() {
    return {
      size: { width: 100, height: 100 },
    };
  },
  component(props) {
    return <ReactComponentBinding {...props.cellProps} component="hello" />;
  },
});

defineShape('rect', {
  shapeType: 'node',
  group: true,
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

defineShape('rect-child', {
  shapeType: 'node',
  group: true,
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

defineShape('child', {
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

defineShape('child-2', {
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

const ydoc = new YDoc();
const domainDatabase = ydoc.getMap('domain');

// new IndexeddbPersistence('just-do-it', ydoc);
new WebrtcProvider('just-do-it', ydoc);

const model = new BaseEditorModel({ datasource: domainDatabase, doc: ydoc });

const Operations = observer(() => {
  const canvasModel = useCanvasModel();
  return (
    <div>
      <div>selected: {model.viewStore.selectedNodes.map(n => n.id).join(', ')}</div>
      <div>focusing: {model.viewStore.focusingNode?.id}</div>
      <div onClick={canvasModel.model.handleRedo}>redo</div>
      <div onClick={canvasModel.model.handleUndo}>undo</div>

      <button onClick={canvasModel.model.handleRemoveSelected}>移除选中</button>
      <button
        onClick={() => {
          if (model.viewStore.focusingNode) {
            canvasModel.model.handleRemove({ node: model.viewStore.focusingNode });
          }
        }}
      >
        移除focusing
      </button>
    </div>
  );
});

const Designer = observer(() => {
  const [_, setShowEdge] = useState(false);
  const [showCanvas, setShowCanvas] = useState(true);

  return (
    <div>
      <EditorModelProvider value={model}>
        <CanvasModelProvider>
          <ComponentContainer>
            <ComponentItem name="rect" data={{ type: 'rect' }}></ComponentItem>
            <ComponentItem name="rect-child" data={{ type: 'rect-child' }}></ComponentItem>
            <ComponentItem name="child" data={{ type: 'child' }}></ComponentItem>
            <ComponentItem name="child-2" data={{ type: 'child-2' }}></ComponentItem>
            <ComponentItem name="react" data={{ type: 'react' }}></ComponentItem>
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

          <div style={{ width: 500, height: 500, position: 'relative' }}>
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
                {model.viewStore.focusingNode && <NodeBBox node={model.viewStore.focusingNode.id}>ok</NodeBBox>}
              </Canvas>
            )}
          </div>

          <Operations />
        </CanvasModelProvider>
      </EditorModelProvider>
    </div>
  );
});

export default Designer;
