import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Form, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { NameInput } from '@/lib/components/NameInput';
import { request } from '@/modules/backend-client';
import { useRouter } from 'next/router';

import { ScenarioCreatePayload } from '../types';
import { useTeamLayoutModel } from '../TeamLayout';
import { useLazyFalsy } from '@/lib/hooks';

export interface CreateScenarioRef {
  open(): void;
}

export interface CreateScenarioProps {
  teamId: string;
}

export function useCreateScenario() {
  return useRef<CreateScenarioRef>(null);
}

/**
 * 创建业务场景
 */
export const CreateScenario = forwardRef<CreateScenarioRef, CreateScenarioProps>((props, ref) => {
  const { teamId } = props;
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

  const handleFinish = async (values: ScenarioCreatePayload) => {
    const payload = { ...values, teamId };

    try {
      const id = await request.requestByPost<number>('/wd/visual/web/business-scene/business-scene-create', payload);

      model?.refreshScenarioList();

      router.push(`/team/${teamId}/scenario/${id}`);

      message.success('创建成功');

      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return shouldRender ? (
    <ModalForm<ScenarioCreatePayload>
      open={visible}
      onFinish={handleFinish}
      onOpenChange={setVisible}
      title="新建业务场景"
      layout="horizontal"
      labelCol={{ span: 5 }}
      width="500px"
    >
      <ProFormText
        name="name"
        label="名称"
        placeholder="业务场景名称"
        rules={[{ required: true, message: '请输入名称' }]}
      ></ProFormText>
      <Form.Item name="identity" label="标识符" rules={[{ required: true, message: '请输入标识符' }]}>
        <NameInput placeholder="大写驼峰式，团队内唯一" nameCase="CamelCase" />
      </Form.Item>
      <ProFormText
        name="startVersion"
        label="起始版本号"
        placeholder="major.minor.patch"
        rules={[
          { required: true, message: '请输入版本号' },
          {
            pattern: /^\d+\.\d+\.\d+$/,
            message: '版本号格式不正确，应为 major.minor.patch',
          },
        ]}
      ></ProFormText>
      <ProFormTextArea name="description" label="描述" placeholder="业务场景描述"></ProFormTextArea>
    </ModalForm>
  ) : null;
});

CreateScenario.displayName = 'CreateScenario';
