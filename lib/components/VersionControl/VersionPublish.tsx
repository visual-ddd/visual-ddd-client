import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { message } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { IVersion } from './types';

export interface VersionPublishProps {
  onSubmit: (payload: IVersion) => Promise<void>;
}

export interface VersionPublishRef {
  open(version: IVersion): void;
}

export function useVersionPublishRef() {
  return useRef<VersionPublishRef>(null);
}

/**
 * 版本发布
 */
export const VersionPublish = forwardRef<VersionPublishRef, VersionPublishProps>((props, ref) => {
  const { onSubmit } = props;
  const [version, setStartVersion] = useState<IVersion>();
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      open(startVersion: IVersion) {
        setStartVersion(startVersion);
        setVisible(true);
      },
    };
  });

  const handleFinish = async (values: IVersion) => {
    const payload = { ...version, ...values };
    try {
      await onSubmit(payload);
      message.success('发布成功');
      setVisible(false);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <ModalForm
      size="small"
      title="发布"
      modalProps={{ destroyOnClose: true }}
      open={visible}
      onOpenChange={setVisible}
      layout="horizontal"
      labelCol={{ span: 5 }}
      width="380px"
      onFinish={handleFinish}
      initialValues={version}
    >
      <ProFormText name="currentVersion" label="版本号" disabled></ProFormText>
      <ProFormTextArea name="description" label="描述" placeholder="发布描述"></ProFormTextArea>
    </ModalForm>
  );
});

VersionPublish.displayName = 'VersionPublish';
