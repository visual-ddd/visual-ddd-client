import { useLazyFalsy } from '@/lib/hooks';
import { ignoreFalse } from '@/lib/utils';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, message, Input } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { isGreaterThanVersion, isValidVersion } from '@/lib/components/validator';

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
  const shouldRender = useLazyFalsy(visible);

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

  return shouldRender ? (
    <ModalForm
      size="small"
      title="新增版本"
      open={visible}
      onOpenChange={setVisible}
      layout="horizontal"
      labelCol={{ span: 6 }}
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
        tooltip={
          <span>
            版本号需要遵循
            <a href="https://semver.org/lang/zh-CN/" target="_blank">
              语义化版本规范
            </a>
            , 格式如 <code>MAJOR.MINOR.PATCH</code>
          </span>
        }
        rules={[
          { required: true, message: '请输入版本号' },
          isValidVersion,
          !!startVersion && isGreaterThanVersion(startVersion.currentVersion),
        ].filter(ignoreFalse)}
      ></ProFormText>
      <ProFormTextArea name="description" label="描述" placeholder="描述"></ProFormTextArea>
    </ModalForm>
  ) : null;
});

VersionCreate.displayName = 'VersionCreate';
