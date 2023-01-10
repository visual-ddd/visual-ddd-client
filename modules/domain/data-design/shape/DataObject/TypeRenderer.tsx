import { useCanvasModel, useEditorModel } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { UntitledInCamelCase } from '@/modules/domain/domain-design/dsl/constants';
import { DataObjectTypeDSL, DataObjectTypeName } from '../../dsl';
import { DataObjectEditorModel } from '../../model';

import s from './TypeRenderer.module.scss';

export interface TypeRendererProps {
  type: DataObjectTypeDSL;
  className?: string;
  style?: React.CSSProperties;
}

export const TypeRenderer = observer(function TypeRenderer(props: TypeRendererProps) {
  const { model: canvasModel } = useCanvasModel();
  const { model } = useEditorModel<DataObjectEditorModel>();
  const store = model.dataObjectStore;
  const { type } = props;

  if (type.type !== DataObjectTypeName.Reference) {
    return <span className={classNames('vd-data-type', s.root)}>{type.type}</span>;
  }

  const { target, targetProperty } = type;

  if (target == null || targetProperty == null) {
    return <span className={classNames('vd-data-type', s.root, 'error')}>引用未配置</span>;
  }

  const targetObject = store.getObjectById(target);
  const targetPropertyObject = targetObject?.getPropertyById(targetProperty);

  if (
    targetObject == null ||
    targetPropertyObject == null ||
    // 避免出现循环引用
    targetPropertyObject.type.type === DataObjectTypeName.Reference
  ) {
    return <span className={classNames('vd-data-type', s.root, 'error')}>引用错误</span>;
  }

  const handleClick = () => {
    canvasModel.handleSelect({ cellIds: [targetObject.id] });
  };

  return (
    <span className={classNames('vd-data-type', s.root, 'link')} onClick={handleClick}>
      {targetObject.name}({targetPropertyObject.name || UntitledInCamelCase})
    </span>
  );
});
