import { ExclamationCircleFilled } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';

import s from './index.module.scss';

export interface DesignerTabLabelProps {
  children: React.ReactNode;
  model: {
    hasIssue: boolean;
    hasError: boolean;
    hasWarning: boolean;
  };
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
      {children} {model.hasIssue && <ExclamationCircleFilled />}
    </span>
  );
});
