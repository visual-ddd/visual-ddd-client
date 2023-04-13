import { useCanvasModel, useEditorModel } from '@/lib/editor';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';

import { DomainEditorModel } from '../../../model';
import { DomainObjectColors } from '../../constants';

import s from './index.module.scss';

export interface ReferenceTypeDisplayProps {
  /**
   * 引用 id
   */
  referenceId: string;

  /**
   * 原始名称
   */
  name?: string;
}

export const ReferenceTypeDisplay = observer(function ReferenceTypeDisplay(props: ReferenceTypeDisplayProps) {
  const { referenceId, name } = props;
  const { model: editorModel } = useEditorModel<DomainEditorModel>();
  const { model: canvasModel } = useCanvasModel();
  const object = editorModel.domainObjectStore.getObjectById(referenceId);

  if (object == null) {
    return (
      <Tooltip title="类型未找到" color="#fe474a" placement="right">
        <span className={classNames('vd-ref-type', s.error)}>
          <ExclamationCircleOutlined />
          {name}
        </span>
      </Tooltip>
    );
  }

  const handleNavigate = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();

    canvasModel.handleSelect({ cellIds: [referenceId] });
  };

  return (
    <Tooltip
      placement="right"
      title={
        <span>
          <span
            style={{
              color: DomainObjectColors[object.shapeName],
            }}
          >
            《{object.objectTypeTitle}》{object.readableTitle}
          </span>
          <div>
            <i>点击可跳转</i>
          </div>
        </span>
      }
    >
      <span className={classNames('vd-ref-type', s.root)} onClick={handleNavigate}>
        {object.name}
      </span>
    </Tooltip>
  );
});
