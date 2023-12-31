import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Form, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { NameInput } from '@/lib/components/NameInput';
import { request } from '@/modules/backend-client';
import { useRouter } from 'next/router';

import { DomainCreatePayload } from '../types';
import { useTeamLayoutModel } from '../TeamLayout';
import { useLazyFalsy } from '@/lib/hooks';
import { isValidVersion } from '@/lib/components/validator';

export interface CreateDomainRef {
  open(): void;
}

export interface CreateDomainProps {
  teamId: string;
}

export function useCreateDomain() {
  return useRef<CreateDomainRef>(null);
}

export const CreateDomain = forwardRef<CreateDomainRef, CreateDomainProps>((props, ref) => {
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

  const handleFinish = async (values: DomainCreatePayload) => {
    const payload = { ...values, teamId };

    try {
      const id = await request.requestByPost<number>('/wd/visual/web/domain-design/domain-design-create', payload);

      model?.refreshDomainList();

      router.push(`/team/${teamId}/domain/${id}`);

      message.success('创建成功');

      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return shouldRender ? (
    <ModalForm<DomainCreatePayload>
      open={visible}
      onFinish={handleFinish}
      onOpenChange={setVisible}
      title="新建业务域"
      layout="horizontal"
      labelCol={{ span: 6 }}
      width="500px"
    >
      <ProFormText
        name="name"
        label="名称"
        placeholder="业务域名称"
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
            <a href="https://semver.org/lang/zh-CN/" target="_blank">
              语义化版本规范
            </a>
            , 格式如 <code>MAJOR.MINOR.PATCH</code>
          </span>
        }
        rules={[{ required: true, message: '请输入版本号' }, isValidVersion]}
      ></ProFormText>
      <ProFormTextArea name="description" label="描述" placeholder="业务域描述"></ProFormTextArea>
    </ModalForm>
  ) : null;
});

CreateDomain.displayName = 'CreateDomain';
