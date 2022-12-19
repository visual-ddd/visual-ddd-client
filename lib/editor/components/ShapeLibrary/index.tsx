import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { booleanPredicate } from '@wakeapp/utils';
import classNames from 'classnames';

import { getShape } from '../../Shape';
import { EditorPanel } from '../Panel';
import { ShapeItem } from './ShapeItem';
import s from './index.module.scss';
import { useEditorModel } from '../../Model';

export interface EditorShapeLibraryProps {
  /**
   * 已注册的图形
   */
  shapes: string[];
}

/**
 * 图形库
 */
export const EditorShapeLibrary = observer(function EditorShapeLibrary(props: EditorShapeLibraryProps) {
  const { commandHandler, viewStore } = useEditorModel();
  const { shapes } = props;

  const shapeDetails = useMemo(() => {
    return shapes
      .map(n => {
        const rtn = getShape(n);
        if (rtn == null) {
          console.warn(`Shape ${n} not found`);
        }

        return rtn;
      })
      .filter(booleanPredicate);
  }, [shapes]);

  return (
    <EditorPanel
      className="vd-editor-shape-lib"
      title="组件"
      folded={viewStore.viewState.shapeLibraryFolded}
      onFoldChange={folded => {
        commandHandler.setViewState({ key: 'shapeLibraryFolded', value: folded });
      }}
    >
      <div className={classNames('vd-editor-shape-lib__list', s.list)}>
        {shapeDetails.map(d => {
          return <ShapeItem key={d.name} name={d.title} type={d.name} icon={d.icon} />;
        })}
      </div>
    </EditorPanel>
  );
});
