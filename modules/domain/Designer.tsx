import { GraphBinding, RectBinding } from '@/lib/g6-binding';
import { useState } from 'react';

export default function Designer() {
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  return (
    <div>
      <button onClick={() => setPosition({ x: 100, y: 100 })}>reset position</button>
      <GraphBinding
        options={{
          background: { color: '#fffbe6' },
          grid: { size: 20, visible: true },
        }}
        // @ts-expect-error
        onCell$Click={evt => {
          console.log('click', evt);
        }}
        style={{ width: 500, height: 500 }}
      >
        <RectBinding
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
        ></RectBinding>
      </GraphBinding>
    </div>
  );
}
