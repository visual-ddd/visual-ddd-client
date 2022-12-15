import { observer } from 'mobx-react';
import { useEditorModel } from '../Model';
import { ShapeRenderer } from '../Shape';

/**
 * 节点渲染
 */
export const Cells = observer(function Cells() {
  const { store } = useEditorModel();

  return (
    <>
      {store?.nodes.map(node => {
        return <ShapeRenderer key={node.id} model={node} />;
      })}
    </>
  );
});
