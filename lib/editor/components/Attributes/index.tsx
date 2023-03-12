import { observer } from 'mobx-react';
import { createElement } from 'react';

import { useCanvasModel } from '../../Canvas';
import { SelectNodePlease } from '../SelectNodePlease';
import { EditorForm } from '../Form';
import { getShape } from '../../Shape';

import s from './index.module.scss';
import { Button } from 'antd';

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
  const formModel = formStore.getFormModel(node)!;

  // 已锁定
  const isLocked = viewStore.isFocusingNodeLocked;

  // 是否被协作者锁定
  const isLockedByCollaborator = isLocked && !node.isHierarchyLocked;

  // 被父级节点锁定
  const isLockedByHierarchy = node.isHierarchyLocked && !node.locked;

  const lockTip = !!(isLocked && !model.readonly) && (
    <div className={s.lockInfo}>
      {isLockedByCollaborator ? (
        '其他协作者正在编辑中，暂时禁止编辑'
      ) : isLockedByHierarchy ? (
        '父节点已锁定，禁止编辑'
      ) : (
        <>
          <div>节点已锁定</div>
          <Button onClick={() => model.handleUnLockNode({ node })} disabled={false}>
            解锁
          </Button>
        </>
      )}
    </div>
  );

  if (config.attributeComponent == null) {
    return (
      <>
        {lockTip}
        <SelectNodePlease description="当前图形不支持属性编辑" />
      </>
    );
  }

  return (
    <EditorForm key={node.id} node={node} readonly={model.readonly || isLocked}>
      {lockTip}
      {createElement(config.attributeComponent, {
        model: model.editorModel,
        node,
        formModel,
      })}
    </EditorForm>
  );
});
