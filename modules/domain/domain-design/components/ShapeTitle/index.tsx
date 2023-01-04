import { useEditorModel } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { DomainEditorModel } from '../../model';

import s from './index.module.scss';

export interface ShapeTitleProps {
  nodeId: string;
}

export const ShapeTitle = observer(function ShapeTitle(props: ShapeTitleProps) {
  const { nodeId } = props;
  const { model } = useEditorModel<DomainEditorModel>();
  const store = model.domainObjectStore;
  const obj = store.getObjectById(nodeId);

  return (
    <div className={classNames('vd-shape-title', s.root)}>
      <span className={classNames('vd-shape-title__type', s.type)}>{obj?.objectTypeTitle}-</span>
      <span>{obj?.readableTitle}</span>
    </div>
  );
});
