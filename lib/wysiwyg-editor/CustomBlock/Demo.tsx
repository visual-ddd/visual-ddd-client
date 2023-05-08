import { registerBlock } from '../ReactBlock';

registerBlock<{ count: number }>({
  name: 'demo',
  title: 'Demo',
  initialState: () => ({ count: 0 }),
  render(state, updateState) {
    return (
      <div
        onClick={() => {
          updateState({ count: state.count + 1 });
        }}
      >
        hello: {state.count}
      </div>
    );
  },
});
