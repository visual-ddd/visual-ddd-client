import { toYuan } from '@/lib/utils';
import { request } from '@/modules/backend-client';
import { Button, Divider, Form, InputNumber, Modal, message } from 'antd';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Balance } from './Balance';
import s from './Recharge.module.scss';
import { BalanceSourceType } from './enum';

export function useReChargeModalRef() {
  return useRef<IReChangeModalRef>(null);
}

export interface IReChargeProps {
  userId: number;
  renderFooter?: (nodes: JSX.Element[]) => JSX.Element[];
  onRechargeSuccess?: () => void;
}

export const ReCharge = (props: IReChargeProps) => {
  const [formRef] = Form.useForm();

  const changerBalance = (rechargeBalance: number) =>
    request.requestByPost('/wd/visual/web/balance/balance-account-deposit', {
      id: props.userId,
      balanceSourceType: BalanceSourceType.ManualRecharge,
      rechargeBalance,
    });

  const chargeHandle = async () => {
    const valid = await formRef.validateFields().catch(() => false);
    if (!valid) {
      return;
    }
    const rechargeBalance = formRef.getFieldValue('rechargeBalance');
    Modal.confirm({
      title: '提示',
      content: `是否确认给用户充值 ￥${toYuan(rechargeBalance)} 元`,
      onOk() {
        return changerBalance(rechargeBalance).then(() => {
          message.success('充值成功');
          props.onRechargeSuccess?.();
        });
      },
    });
  };

  const Footer = [
    <Button key="chargerBtn" onClick={chargeHandle} type="primary" htmlType="submit">
      充值
    </Button>,
  ];

  const FinalFooter = useMemo(() => {
    if (props.renderFooter) {
      return props.renderFooter(Footer);
    }
    return Footer;
  }, [props.renderFooter, Footer]);
  return (
    <>
      <Balance userId={props.userId} title="当前余额" />
      <Divider />
      <Form form={formRef}>
        <Form.Item label="充值金额" name="rechargeBalance" rules={[{ required: true }]}>
          <InputNumber addonAfter="分" />
        </Form.Item>
        <Form.Item>
          <div className={s.actions}>{FinalFooter}</div>
        </Form.Item>
      </Form>
    </>
  );
};

export interface IReChangeModalRef {
  open(userId: number): void;
}

export const ReChargeModal = forwardRef<IReChangeModalRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [userId, setUserId] = useState<number>();
  const handleCancel = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    open(id: number) {
      setUserId(id);
      setVisible(true);
    },
  }));

  return (
    <Modal open={visible} footer={null} onCancel={handleCancel} centered width={600} destroyOnClose>
      <ReCharge
        onRechargeSuccess={() => {
          handleCancel();
        }}
        userId={userId!}
        renderFooter={nodes => [
          ...nodes,
          <Button onClick={handleCancel} key="cancelBtn">
            取消
          </Button>,
        ]}
      ></ReCharge>
    </Modal>
  );
});

ReChargeModal.displayName = 'ChangerModal';
