import { LeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useDomainDesignerContext } from '../Context';
import { DomainDesignerTabsMap } from '../model';

import s from './index.module.scss';

export const DomainDesignerHeader = observer(function DesignerHeader(props: {}) {
  const model = useDomainDesignerContext()!;

  return (
    <div className={classNames('vd-domain-header', s.root)}>
      <div className={classNames('vd-domain-header__back', s.back)}>
        <LeftOutlined />
      </div>
      <div className={classNames('vd-domain-header__aside', s.aside)}></div>
      <div className={classNames('vd-domain-header__center', s.center)}>
        <span className={classNames('vd-domain-header__title', s.title)}>
          {DomainDesignerTabsMap[model.activeTab]}
          {model.readonly && <span className="u-gray-500">(只读)</span>}
        </span>
      </div>
      {!model.readonly && (
        <div className={classNames('vd-domain-header__aside', s.aside)}>
          <Button type="primary" size="small" loading={model.saving} onClick={model.save}>
            保存
          </Button>
        </div>
      )}
    </div>
  );
});
