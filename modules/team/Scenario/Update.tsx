import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { request } from '@/modules/backend-client';
import { useRouter } from 'next/router';

import { ScenarioDetail, ScenarioUpdatePayload } from '../types';
import { useTeamLayoutModel } from '../TeamLayout';
import { useLazyFalsy } from '@/lib/hooks';

export interface UpdateScenarioRef {
  open(): void;
}

export interface UpdateScenarioProps {
  detail: ScenarioDetail;
}

export function useUpdateScenario() {
  return useRef<UpdateScenarioRef>(null);
}

export const UpdateScenario = forwardRef<UpdateScenarioRef, UpdateScenarioProps>((props, ref) => {
  const { detail } = props;
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const model = useTeamLayoutModel();
  const shouldRender = useLazyFalsy(visible);

  useImperativeHandle(ref, () => {
    return {
      open() {
        setVisible(true);
      },
    };
  });

  const handleFinish = async (values: ScenarioDetail) => {
    try {
      const { id } = detail;
      const { description, name } = values;
      const payload: ScenarioUpdatePayload = { id, description, name };
      await request.requestByPost('/wd/visual/web/business-scene/business-scene-update', payload);

      model?.refreshScenarioList();

      message.success('保存成功');

      router.replace(router.asPath);

      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const handleDelete = async () => {
    const val = window.prompt(
      '确定删除业务场景？删除业务场景可能导致严重后果，如果确定要删除，请输入当前业务场景的 **标识符** '
    );

    if (val !== detail.identity) {
      return;
    }

    try {
      await request.requestByPost('/wd/visual/web/business-scene/business-scene-remove', { id: detail.id });

      message.success('已删除');

      router.replace(`/team/${detail.teamId}/scenario`);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return shouldRender ? (
    <ModalForm<ScenarioDetail>
      open={visible}
      initialValues={detail}
      onFinish={handleFinish}
      onOpenChange={setVisible}
      title="编辑业务场景"
      layout="horizontal"
      labelCol={{ span: 5 }}
      width="500px"
      submitter={{
        render(props, dom) {
          return [
            <Button danger key="delete" onClick={handleDelete}>
              删除业务场景
            </Button>,
            ...dom,
          ];
        },
      }}
    >
      <ProFormText
        name="name"
        label="名称"
        placeholder="业务场景名称"
        rules={[{ required: true, message: '请输入名称' }]}
      ></ProFormText>
      <ProFormText name="identity" label="标识符" disabled></ProFormText>
      <ProFormTextArea name="description" label="描述" placeholder="业务场景描述"></ProFormTextArea>
    </ModalForm>
  ) : null;
});

UpdateScenario.displayName = 'UpdateScenario';
