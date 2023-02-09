import { useEditorModel } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { MapperEditorModel } from '../model';

export interface ShapeTitleProps {
  nodeId: string;
}

export const ShapeTitle = observer(function ShapeTitle(props: ShapeTitleProps) {
  const { nodeId } = props;
  const { model } = useEditorModel<MapperEditorModel>();
  const store = model.mapperStore;
  const obj = store.getMapperById(nodeId);

  return (
    <div className={classNames('vd-shape-title')}>
      <span>{obj?.readableTitle}</span>
    </div>
  );
});
