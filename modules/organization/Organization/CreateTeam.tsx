import { Modal, message } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { request } from '@/modules/backend-client';

import { BaseInfo, useBaseInfo } from './BaseInfo';
import { TeamCreatePayload } from '../types';

export interface CreateTeamProps {
  organizationId: string;
  onCreated?: () => void;
}

export interface CreateTeamRef {
  open(): void;
}

export function useCreateTeam() {
  return useRef<CreateTeamRef>(null);
}

/**
 * 创建团队
 */
export const CreateTeam = forwardRef<CreateTeamRef, CreateTeamProps>((props, ref) => {
  const { organizationId, onCreated } = props;
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useBaseInfo();

  const handleFinish = async (value: TeamCreatePayload) => {
    try {
      setSaving(true);
      const payload = { ...value, organizationId };

      await request.requestByPost('/wd/visual/web/team/team-create', payload);

      message.success('创建成功');
      onCreated?.();
      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleOk = async () => {
    const values = await formRef.current!.getValues();
    handleFinish(values);
  };

  useImperativeHandle(ref, () => {
    return {
      open() {
        setVisible(true);
      },
    };
  });

  return (
    <Modal
      title="新增团队"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={400}
      confirmLoading={saving}
      destroyOnClose
    >
      <BaseInfo ref={formRef} />
    </Modal>
  );
});

CreateTeam.displayName = 'CreateTeam';
