import { useEditorModel } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { DataObjectEditorModel } from '../model';

export interface ShapeTitleProps {
  nodeId: string;
}

export const ShapeTitle = observer(function ShapeTitle(props: ShapeTitleProps) {
  const { nodeId } = props;
  const { model } = useEditorModel<DataObjectEditorModel>();
  const store = model.dataObjectStore;
  const obj = store.getObjectById(nodeId);

  return (
    <div className={classNames('vd-shape-title')}>
      <span>{obj?.readableTitle}</span>
    </div>
  );
});
