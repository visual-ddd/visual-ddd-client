import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import Input from 'antd/es/input/Input';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { IVersion, VersionCreatePayload } from './types';

export interface VersionCreateProps {
  onSubmit: (payload: VersionCreatePayload) => Promise<void>;
}

export interface VersionCreateRef {
  open(baseVersion: IVersion): void;
}

export function useVersionCreateRef() {
  return useRef<VersionCreateRef>(null);
}

/**
 * 版本创建
 */
export const VersionCreate = forwardRef<VersionCreateRef, VersionCreateProps>((props, ref) => {
  const { onSubmit } = props;
  const [startVersion, setStartVersion] = useState<IVersion>();
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      open(startVersion: IVersion) {
        setStartVersion(startVersion);
        setVisible(true);
      },
    };
  });

  const handleFinish = async (values: VersionCreatePayload) => {
    const payload = { ...values, startVersionId: startVersion!.id! };
    try {
      await onSubmit(payload);
      message.success('创建成功');
      setVisible(false);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <ModalForm
      size="small"
      title="新增版本"
      modalProps={{ destroyOnClose: true }}
      open={visible}
      onOpenChange={setVisible}
      layout="horizontal"
      labelCol={{ span: 5 }}
      width="380px"
      onFinish={handleFinish}
    >
      <Form.Item name="startVersionId" label="基版本">
        <div>
          <Input disabled value={startVersion?.currentVersion} />
        </div>
      </Form.Item>
      <ProFormText
        name="currentVersion"
        label="新版本"
        rules={[
          { required: true, message: '请输入版本号' },
          {
            pattern: /^\d+\.\d+\.\d+$/,
            message: '格式不正确，应为 major.minor.patch',
          },
        ]}
      ></ProFormText>
      <ProFormTextArea name="description" label="描述" placeholder="描述"></ProFormTextArea>
    </ModalForm>
  );
});

VersionCreate.displayName = 'VersionCreate';
