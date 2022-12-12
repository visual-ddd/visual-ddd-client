import { Graph } from '@antv/x6';
import {
  GraphBinding,
  RectBinding,
  ReactComponentBinding,
  EdgeBinding,
  registerX6ReactComponent,
} from '@/lib/g6-binding';
import { useState } from 'react';
import { ComponentContainer, ComponentItem } from '@/lib/editor';

function MyComponent() {
  const [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(i => i + 1)} style={{ background: 'red', width: 200 }}>
      hello world {count}
    </div>
  );
}

registerX6ReactComponent('hello', MyComponent);

const options: Graph.Options = {
  background: { color: '#fffbe6' },
  grid: { size: 20, visible: true },
  embedding: {
    enabled: true,
    findParent: 'bbox',
  },
};

export default function Designer() {
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState({ x: 100, y: 100 });

  return (
    <div>
      <button onClick={() => setPosition({ x: 100, y: 100 })}>reset position</button>
      <ComponentContainer>
        <ComponentItem name="demo" data={{ type: 'ok' }}></ComponentItem>
      </ComponentContainer>
      <div
        style={{ width: 100, height: 100, border: '1px solid red' }}
        onDragOver={evt => {
          evt.preventDefault();
          console.log('drag over', evt);
          evt.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={evt => {
          console.log('drop x', evt);
        }}
      ></div>
      <GraphBinding
        options={options}
        // @ts-expect-error
        onCell$Click={evt => {
          console.log('click', evt);
        }}
        style={{ width: 500, height: 500 }}
        onDrop={e => console.log('drop', e)}
      >
        <RectBinding
          size={{ width: 300, height: 300 }}
          position={{ x: 300, y: 300 }}
          zIndex={1}
          // @ts-expect-error
          onChange$Children={e => console.log('change children', e)}
        >
          <RectBinding
            id="one"
            position={position}
            size={{ width: 100, height: 100 }}
            label={'Hello ' + count}
            // @ts-expect-error
            onChange$position={evt => {
              console.log('fuck', evt);
              setPosition(evt.current);
            }}
            // @ts-expect-error
            onChange$attrs={evt => {
              console.log('change attrs', evt);
            }}
            onClick={evt => {
              console.log('click rect', evt);
              setCount(c => c + 1);
            }}
            zIndex={10}
          ></RectBinding>
        </RectBinding>
        <ReactComponentBinding id="two" position={{ x: 10, y: 10 }} component="hello"></ReactComponentBinding>
        <EdgeBinding target="one" source="two" label={`ok ${count}`} />
      </GraphBinding>
    </div>
  );
}
