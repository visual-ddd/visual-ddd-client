import { Modal, Tabs } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

// import { Plan } from '@/modules/plan/Plan';
import classNames from 'classnames';
// import { Wallet } from '../Wallet/Wallet';
import { BaseInfo } from './BaseInfo';
// import { Invites } from './Invites';
import { ResetPassword } from './ResetPassword';
import s from './index.module.scss';

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
      width={900}
      onCancel={handleCancel}
      centered
      title="账户信息"
      destroyOnClose
      className={classNames('vd-account-setting', s.root)}
    >
      <Tabs
        tabPosition="left"
        size="small"
        destroyInactiveTabPane
        className={classNames('vd-account-setting__tabs', s.tabs)}
        items={[
          {
            label: `基本信息`,
            key: 'base',
            children: <BaseInfo />,
          },
          // {
          //   label: `用户邀请`,
          //   key: 'invites',
          //   children: <Invites />,
          // },
          // {
          //   label: '我的钱包',
          //   key: 'wallet',
          //   children: <Wallet />,
          // },
          // {
          //   label: '订阅信息',
          //   key: 'plan',
          //   children: <Plan />,
          // },
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
