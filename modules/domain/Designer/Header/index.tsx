import { VersionBadge } from '@/lib/components/VersionBadge';
import { VersionStatus } from '@/lib/core';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useDomainDesignerContext } from '../Context';
import { DomainDesignerTabsMap } from '../model';

import s from './index.module.scss';

export interface DomainDesignerHeaderProps {
  name?: React.ReactNode;
  version?: string;
  versionStatus?: VersionStatus;
}

export const DomainDesignerHeader = observer(function DesignerHeader(props: DomainDesignerHeaderProps) {
  const { name, version, versionStatus } = props;
  const router = useRouter();
  const model = useDomainDesignerContext()!;
  const saveTitle = useMemo(() => {
    const desc = model.keyboardBinding.getReadableKeyBinding('save');
    return `${desc.description}(${desc.key})`;
  }, [model]);

  return (
    <div className={classNames('vd-domain-header', s.root)}>
      <div className={classNames('vd-domain-header__back', s.back)} onClick={router.back} title="返回上一级">
        <LeftOutlined />
      </div>
      <div className={classNames('vd-domain-header__aside', s.aside)}>
        {version != null && versionStatus != null && <VersionBadge version={version} status={versionStatus} />}
      </div>
      <div className={classNames('vd-domain-header__center', s.center)}>
        <span className={classNames('vd-domain-header__title', s.title)}>
          {!!name && (
            <>
              <span className={classNames('vd-domain-header__name', s.name)}>{name}</span>
              <span className={classNames('vd-domain-header__split', s.split)}>/</span>
            </>
          )}
          {DomainDesignerTabsMap[model.activeTab]}
          {model.readonly && <span className="u-gray-500">(只读)</span>}
        </span>
      </div>
      {!model.readonly && (
        <div className={classNames('vd-domain-header__aside', s.aside)}>
          <Tooltip title={saveTitle} placement="bottomRight">
            <Button
              type="primary"
              size="small"
              loading={model.saving}
              onClick={() => {
                model.keyboardBinding.trigger('save');
              }}
            >
              保存
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  );
});
