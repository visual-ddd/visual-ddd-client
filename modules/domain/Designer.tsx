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
  selectable: false,
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
  dropFactory() {
    return {
      size: { width: 50, height: 50 },
      zIndex: 2,
      attrs: {
        body: {
          fill: 'red',
        },
      },
    };
  },
  component(props) {
    return <RectBinding {...props.cellProps} />;
  },
});

const store = new BaseEditorStore();

const Operations = observer(() => {
  return <div>selected: {store.selectedNodes.map(n => n.id).join(', ')}</div>;
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
