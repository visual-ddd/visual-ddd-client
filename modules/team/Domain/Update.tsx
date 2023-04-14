import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { request } from '@/modules/backend-client';
import { useRouter } from 'next/router';

import { DomainDetail, DomainUpdatePayload } from '../types';
import { useTeamLayoutModel } from '../TeamLayout';
import { useLazyFalsy } from '@/lib/hooks';

export interface UpdateDomainRef {
  open(): void;
}

export interface UpdateDomainProps {
  detail: DomainDetail;
}

export function useUpdateDomain() {
  return useRef<UpdateDomainRef>(null);
}

export const UpdateDomain = forwardRef<UpdateDomainRef, UpdateDomainProps>((props, ref) => {
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

  const handleFinish = async (values: DomainDetail) => {
    try {
      const { id } = detail;
      const { description, name } = values;
      const payload: DomainUpdatePayload = { id, description, name };
      await request.requestByPost('/wd/visual/web/domain-design/domain-design-update', payload);

      model?.refreshDomainList();

      message.success('保存成功');

      router.replace(router.asPath);

      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const handleDelete = async () => {
    const val = window.prompt(
      '确定删除业务域？删除业务域可能导致严重后果，如果确定要删除，请输入当前业务域的 **标识符** '
    );

    if (val !== detail.identity) {
      return;
    }

    try {
      await request.requestByPost('/wd/visual/web/domain-design/domain-design-remove', { id: detail.id });

      message.success('已删除');

      router.replace(`/team/${detail.teamId}/domain`);

      model?.refreshDomainList();

      setVisible(false);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return shouldRender ? (
    <ModalForm<DomainDetail>
      open={visible}
      initialValues={detail}
      onFinish={handleFinish}
      onOpenChange={setVisible}
      title="编辑业务域"
      layout="horizontal"
      labelCol={{ span: 5 }}
      width="500px"
      submitter={{
        render(props, dom) {
          return [
            <Button danger key="delete" onClick={handleDelete}>
              删除业务域
            </Button>,
            ...dom,
          ];
        },
      }}
    >
      <ProFormText
        name="name"
        label="名称"
        placeholder="业务域名称"
        rules={[{ required: true, message: '请输入名称' }]}
      ></ProFormText>
      <ProFormText name="identity" label="标识符" disabled></ProFormText>
      <ProFormTextArea name="description" label="描述" placeholder="业务域描述"></ProFormTextArea>
    </ModalForm>
  ) : null;
});

UpdateDomain.displayName = 'CreateDomain';
