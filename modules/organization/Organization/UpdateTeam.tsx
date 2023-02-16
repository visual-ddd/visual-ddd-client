import { Button, Form, message, Modal, Tabs } from 'antd';
import { forwardRef, useImperativeHandle, useRef, Ref, useState } from 'react';
import { request } from '@/modules/backend-client';

import { TeamCreatePayload, TeamDetail } from '../types';
import { BaseInfo, useBaseInfo } from './BaseInfo';
import { TeamMember } from './TeamMember';
import s from './UpdateTeam.module.scss';
import classNames from 'classnames';

export interface UpdateTeamProps {
  onFinish?: () => void;
  lazyRef?: Ref<UpdateTeamRef>;
}

export interface UpdateTeamRef {
  open(detail: TeamDetail): void;
}

enum TAB_KEYS {
  /**
   * 基本信息
   */
  Base = 'base',
  /**
   * 成员管理
   */
  Member = 'member',
}

export function useUpdateTeam() {
  return useRef<UpdateTeamRef>(null);
}

export const UpdateTeam = forwardRef<UpdateTeamRef, UpdateTeamProps>((props, ref) => {
  const { onFinish, lazyRef } = props;
  const [visible, setVisible] = useState(false);
  const [activeKey, setActiveKey] = useState(TAB_KEYS.Base);
  const [saving, setSaving] = useState(false);
  const baseInfoRef = useBaseInfo();
  const [detail, setDetail] = useState<TeamDetail>();

  const onTabChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey as TAB_KEYS);
  };

  const handleFinish = async (value: TeamCreatePayload) => {
    try {
      setSaving(true);
      const payload = { ...value, organizationId: detail?.organizationId, id: detail?.id };

      await request.requestByPost('/wd/visual/web/team/team-update', payload);

      message.success('保存成功');
      onFinish?.();
      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleOk = async () => {
    const baseInfo = await baseInfoRef.current!.getValues();

    handleFinish(baseInfo);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  useImperativeHandle(lazyRef || ref, () => {
    return {
      open(detail: TeamDetail) {
        setDetail(detail);
        setVisible(true);
      },
    };
  });

  return (
    <Modal
      title="编辑团队"
      open={visible}
      onCancel={handleCancel}
      width={700}
      destroyOnClose
      className={classNames('vd-update-team', s.root)}
      footer={null}
    >
      {!!detail && (
        <Tabs
          tabPosition="left"
          className={classNames('vd-update-team__tabs', s.tabs)}
          items={[
            {
              label: `基本信息`,
              key: TAB_KEYS.Base,
              children: (
                <BaseInfo
                  className={classNames('vd-update-team__base', s.base)}
                  ref={baseInfoRef}
                  initialValue={detail}
                >
                  <Form.Item wrapperCol={{ offset: 6 }}>
                    <Button type="primary" loading={saving} onClick={handleOk}>
                      保存
                    </Button>
                  </Form.Item>
                </BaseInfo>
              ),
            },
            {
              label: `成员管理`,
              key: TAB_KEYS.Member,
              children: <TeamMember detail={detail} />,
            },
          ]}
          onChange={onTabChange}
          activeKey={activeKey}
        />
      )}
    </Modal>
  );
});

UpdateTeam.displayName = 'UpdateTeam';

export default UpdateTeam;
