import { observer } from 'mobx-react';
import { createElement } from 'react';

import { useCanvasModel } from '../../Canvas';
import { SelectNodePlease } from '../SelectNodePlease';
import { EditorForm } from '../Form';
import { getShape } from '../../Shape';

/**
 * 属性编辑器
 */
export const EditorAttributes = observer(function EditorAttributes() {
  const { model } = useCanvasModel();
  const viewStore = model.editorViewStore;
  const formStore = model.editorFormStore;
  const node = viewStore.focusingNode;

  if (node == null) {
    return <SelectNodePlease />;
  }

  const config = getShape(node.name)!;

  if (config.attributeComponent == null) {
    return <SelectNodePlease description="当前图形不支持属性编辑" />;
  }

  const formModel = formStore.getFormModel(node)!;

  return (
    <EditorForm node={node}>
      {createElement(config.attributeComponent, {
        model: model.editorModel,
        node,
        formModel,
      })}
    </EditorForm>
  );
});
