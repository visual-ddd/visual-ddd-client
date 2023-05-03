import { Modal, Spin } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { UpgradePlanList } from './Plan';
import { useCurrentPlan } from './useCurrentPlan';

interface IUpgradeRef {
  open(): void;
}

export function useUpgradeModal() {
  return useRef<IUpgradeRef>(null);
}

export const UpgradeModal = forwardRef<IUpgradeRef>((_, ref) => {
  const [visible, setVisible] = useState(false);

  const { currentPlan, isLoading } = useCurrentPlan();

  const handleCancel = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    open() {
      setVisible(true);
    },
  }));

  return (
    <Modal title="套餐升级" open={visible} onCancel={handleCancel} centered destroyOnClose width={600} footer={null}>
      <Spin spinning={isLoading}>
        <UpgradePlanList
          currentPlan={currentPlan}
          onSuccess={() => {
            handleCancel();
          }}
        />
      </Spin>
    </Modal>
  );
});

UpgradeModal.displayName = 'PlanUpgradeModal';
