import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Modal, Tabs } from 'antd';

import { BaseInfo } from './BaseInfo';
import { ResetPassword } from './ResetPassword';
import s from './index.module.scss';
import classNames from 'classnames';

export interface AccountSettingProps {}

export interface AccountSettingRef {
  open: () => void;
}

export function useAccountSetting() {
  return useRef<AccountSettingRef>(null);
}

/**
 * 用户设置
 * @param props
 * @returns
 */
export const AccountSetting = forwardRef<AccountSettingRef, AccountSettingProps>((props, ref) => {
  const [visible, setVisible] = useState(false);

  const handleCancel = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    open() {
      setVisible(true);
    },
  }));

  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={handleCancel}
      title="账户设置"
      destroyOnClose
      className={classNames('vd-account-setting', s.root)}
    >
      <Tabs
        tabPosition="left"
        destroyInactiveTabPane
        className={classNames('vd-account-setting__tabs', s.tabs)}
        items={[
          {
            label: `基本信息`,
            key: 'base',
            children: <BaseInfo />,
          },
          {
            label: `重置密码`,
            key: 'reset',
            children: <ResetPassword />,
          },
        ]}
      />
    </Modal>
  );
});

AccountSetting.displayName = 'AccountSetting';

export default AccountSetting;
