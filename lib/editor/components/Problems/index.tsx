import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useCanvasModel } from '../../Canvas';
import { EditorFormIssues } from '../Form/FormIssues';
import { SelectNodePlease } from '../SelectNodePlease';
import s from './index.module.scss';

export const EditorProblems = observer(function EditorProblems() {
  const { model } = useCanvasModel();
  const viewStore = model.editorViewStore;
  const formStore = model.editorFormStore;
  const node = viewStore.focusingNode;

  if (node == null) {
    return <SelectNodePlease />;
  }

  const formModel = formStore.getFormModel(node)!;

  if (!formModel.hasIssue) {
    return <SelectNodePlease description="暂无告警" />;
  }

  return (
    <div className={classNames('vd-editor-problems', s.root)}>
      <EditorFormIssues issues={formModel.errorInArray} />
    </div>
  );
});
