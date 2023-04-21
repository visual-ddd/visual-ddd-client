import { ExclamationCircleFilled } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import { IValidateStatus } from '@/lib/core';

import s from './index.module.scss';

export interface DesignerTabLabelProps {
  children: React.ReactNode;
  model: IValidateStatus;
}

export const DesignerTabLabel = observer(function DesignerTabLabel(props: DesignerTabLabelProps) {
  const { children, model } = props;
  return (
    <span
      className={classNames('vd-tab-label', s.root, {
        error: model.hasError,
        warning: model.hasWarning,
      })}
    >
      {children} {model.hasException && <ExclamationCircleFilled />}
    </span>
  );
});
