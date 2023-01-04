import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useCanvasModel } from '../../Canvas';
import { useEditorConfiguration } from '../Configuration';
import { EditorFormIssues } from '../Form/FormIssues';
import { SelectNodePlease } from '../SelectNodePlease';
import s from './index.module.scss';

export const EditorProblems = observer(function EditorProblems() {
  const { model } = useCanvasModel();
  const viewStore = model.editorViewStore;
  const formStore = model.editorFormStore;
  const config = useEditorConfiguration();
  const node = viewStore.focusingNode;

  // 全局告警
  if (node == null) {
    if (!formStore.hasIssue) {
      return <SelectNodePlease description="暂无告警" />;
    }

    return (
      <div className={classNames('vd-editor-problems', s.root)}>
        <ul className={classNames('vd-editor-problems__list', s.list)}>
          {formStore.nodesHasIssue.map(node => {
            const handleClick = () => {
              model.handleSelect({ cellIds: [node.id] });
            };

            return (
              <li key={node.id} className={classNames('vd-editor-problems__item', s.item)}>
                <div className={classNames('vd-editor-problems__item-name', s.itemName)} onClick={handleClick}>
                  {config.renderTitle ? config.renderTitle(node.node) : node.id}{' '}
                </div>
                <EditorFormIssues
                  className={classNames('vd-editor-problems__item-body', s.itemBody)}
                  issues={node.errorInArray}
                />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // 节点告警
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
