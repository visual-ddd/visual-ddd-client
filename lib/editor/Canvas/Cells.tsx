import { observer } from 'mobx-react';
import { useEditorStore } from '../Model';
import { ShapeRenderer } from '../Shape';

/**
 * 节点渲染
 */
export const Cells = observer(function Cells() {
  const store = useEditorStore();

  return (
    <>
      {store?.nodes.map(node => {
        return <ShapeRenderer key={node.id} model={node} />;
      })}
    </>
  );
});
