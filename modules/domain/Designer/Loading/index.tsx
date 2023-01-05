import { Spin } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useDomainDesignerContext } from '../Context';

import s from './index.module.scss';

export const DomainDesignerLoading = observer(function DomainDesignerLoading() {
  const model = useDomainDesignerContext();

  if (!model?.loading) {
    return null;
  }

  return (
    <div className={classNames('vd-designer-loading', s.mask)}>
      <div className={classNames('vd-designer-loading__body', s.root)}>
        <Spin tip="设计器加载中"></Spin>
      </div>
    </div>
  );
});
