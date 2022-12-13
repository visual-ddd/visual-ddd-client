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

const List: FC<{ list: BaseNode[] }> = observer(props => {
  return (
    <>
      {props.list.map(i => (
        <RectBinding
          key={i.id}
          position={i.properties.position}
          size={{ width: 100, height: 100 }}
          onEmbedded={e => {
            console.log('embedded', e);
          }}
          data={{}}
        >
          {!!i.children.length && <List list={i.children} />}
        </RectBinding>
      ))}
    </>
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
      </EditorStoreProvider>
    </div>
  );
});

export default Designer;
