import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { request } from '@/modules/backend-client';
import { useRouter } from 'next/router';

import { AppDetail, AppUpdatePayload } from '../types';
import { useTeamLayoutModel } from '../TeamLayout';
import { useLazyFalsy } from '@/lib/hooks';

export interface UpdateAppRef {
  open(): void;
}

export interface UpdateAppProps {
  detail: AppDetail;
}

export function useUpdateApp() {
  return useRef<UpdateAppRef>(null);
}

export const UpdateApp = forwardRef<UpdateAppRef, UpdateAppProps>((props, ref) => {
  const { detail } = props;
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const shouldRender = useLazyFalsy(visible);
  const model = useTeamLayoutModel();

  useImperativeHandle(ref, () => {
    return {
      open() {
        setVisible(true);
      },
    };
  });

  const handleFinish = async (values: AppDetail) => {
    try {
      const { id } = detail;
      const { description, name, packageName } = values;
      const payload: AppUpdatePayload = { id, description, name, packageName };
      await request.requestByPost('/wd/visual/web/application/application-update', payload);

      model?.refreshAppList();

      message.success('保存成功');

      router.replace(router.asPath);

      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const handleDelete = async () => {
    const val = window.prompt('确定删除应用？删除应用可能导致严重后果，如果确定要删除，请输入当前应用的 **标识符** ');

    if (val !== detail.identity) {
      return;
    }

    try {
      await request.requestByPost('/wd/visual/web/application/application-remove', { id: detail.id });

      message.success('已删除');

      router.replace(`/team/${detail.teamId}/app`);

      model?.refreshAppList();

      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return shouldRender ? (
    <ModalForm<AppDetail>
      open={visible}
      initialValues={detail}
      onFinish={handleFinish}
      onOpenChange={setVisible}
      title="编辑应用"
      layout="horizontal"
      labelCol={{ span: 5 }}
      width="500px"
      submitter={{
        render(props, dom) {
          return [
            <Button danger key="delete" onClick={handleDelete}>
              删除应用
            </Button>,
            ...dom,
          ];
        },
      }}
    >
      <ProFormText
        name="name"
        label="名称"
        placeholder="应用名称"
        rules={[{ required: true, message: '请输入名称' }]}
      ></ProFormText>
      <ProFormText name="identity" label="标识符" disabled></ProFormText>
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

UpdateApp.displayName = 'CreateDomain';
