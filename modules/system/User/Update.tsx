import { request } from '@/modules/backend-client';
import { Form, Input, message, Modal } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { UserDetail } from '../types';

export interface UpdateUserProps {
  onFinish(): void;
}

export interface UpdateUserRef {
  open(detail: UserDetail): void;
}

interface UpdateUserPayload {
  id: number;
  icon?: string;
  description: string;
  userName: string;
  newPassword?: string;
}

export function useUpdateUser() {
  return useRef<UpdateUserRef>(null);
}

export const UpdateUser = forwardRef<UpdateUserRef, UpdateUserProps>((props, ref) => {
  const { onFinish } = props;
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<UserDetail>();

  const handleCancel = () => {
    setVisible(false);
  };

  const handleOk = () => {
    form.submit();
  };

  /**
   * 提交表单
   * @param values
   */
  const handleFinish = async (values: UpdateUserPayload) => {
    try {
      setSaving(true);
      const { newPassword, userName, description } = values;
      const { id } = editing!;
      const payload: UpdateUserPayload = {
        userName,
        description,
        id,
      };

      if (newPassword) {
        payload.newPassword = newPassword;
      }

      await request.requestByPost('/wd/visual/web/account/account-update', payload);

      message.success('更新成功');
      setVisible(false);
      onFinish();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      open(user: UserDetail) {
        form.setFieldsValue(user);
        setEditing(user);
        setVisible(true);
      },
    };
  });

  return (
    <Modal
      title="编辑用户"
      open={visible}
      onOk={handleOk}
      confirmLoading={saving}
      onCancel={handleCancel}
      okText="保存"
      width={400}
      destroyOnClose
    >
      <Form<UpdateUserPayload>
        name="form"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 15 }}
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item label="用户名" name="userName" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input placeholder="名称" autoComplete="off" />
        </Form.Item>

        <Form.Item label="邮箱" name="accountNo">
          <Input placeholder="邮箱" disabled />
        </Form.Item>

        <Form.Item label="重置密码" name="newPassword">
          <Input.Password placeholder="密码(可选)" autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
});

UpdateUser.displayName = 'UpdateUser';
