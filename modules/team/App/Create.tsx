import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Form, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { NameInput } from '@/lib/components/NameInput';
import { request } from '@/modules/backend-client';
import { useRouter } from 'next/router';

import { AppCreatePayload } from '../types';
import { useTeamLayoutModel } from '../TeamLayout';
import { useLazyFalsy } from '@/lib/hooks';
import { isValidVersion } from '@/lib/components/validator';

export interface CreateAppRef {
  open(): void;
}

export interface CreateAppProps {
  teamId: string;
}

export function useCreateApp() {
  return useRef<CreateAppRef>(null);
}

export const CreateApp = forwardRef<CreateAppRef, CreateAppProps>((props, ref) => {
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

  const handleFinish = async (values: AppCreatePayload) => {
    const payload = { ...values, teamId };

    try {
      const id = await request.requestByPost<number>('/wd/visual/web/application/application-create', payload);

      model?.refreshAppList();

      router.push(`/team/${teamId}/app/${id}`);

      message.success('创建成功');

      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return shouldRender ? (
    <ModalForm<AppCreatePayload>
      open={visible}
      onFinish={handleFinish}
      onOpenChange={setVisible}
      title="新建应用"
      layout="horizontal"
      labelCol={{ span: 6 }}
      width="500px"
    >
      <ProFormText
        name="name"
        label="名称"
        placeholder="应用名称"
        rules={[{ required: true, message: '请输入名称' }]}
      ></ProFormText>
      <Form.Item name="identity" label="标识符" rules={[{ required: true, message: '请输入标识符' }]}>
        <NameInput placeholder="大写驼峰式，团队内唯一" nameCase="CamelCase" />
      </Form.Item>
      <ProFormText
        name="startVersion"
        label="起始版本号"
        placeholder="major.minor.patch"
        tooltip={
          <span>
            版本号需要遵循
            <a href="https://semver.org/lang/zh-CN/" target="_blank" className="u-link">
              语义化版本规范
            </a>
            , 格式如 <code>MAJOR.MINOR.PATCH</code>
          </span>
        }
        rules={[{ required: true, message: '请输入版本号' }, isValidVersion]}
      ></ProFormText>
      <ProFormText
        name="packageName"
        label="包名"
        tooltip="通常为反向域名"
        placeholder="com.example.app"
        rules={[
          { required: true, message: '请输入包名' },
          {
            pattern: /^[a-zA-Z]+(\.[a-zA-Z]+)*$/,
            message: '包名格式错误',
          },
        ]}
      ></ProFormText>
      <ProFormTextArea name="description" label="描述" placeholder="应用描述"></ProFormTextArea>
    </ModalForm>
  ) : null;
});

CreateApp.displayName = 'CreateApp';
