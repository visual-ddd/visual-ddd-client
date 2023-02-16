import { request } from '@/modules/backend-client';
import { useSession } from '@/modules/session';
import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';

import s from './ResetPassword.module.scss';

interface ResetPasswordPayload {
  id: number;
  newPassword: string;
  oldPassword: string;
}

export const ResetPassword = () => {
  const [form] = Form.useForm();
  const { session, isLoading } = useSession();
  const [saving, setSaving] = useState(false);
  const loading = saving || isLoading;

  const handleFinish = async (values: ResetPasswordPayload) => {
    try {
      setSaving(true);
      const payload = { ...values, id: session?.user.id };
      await request.requestByPost('/wd/visual/web/account/account-password-update', payload);
      message.success('重置密码成功!');
      form.resetFields();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 15 }}
      autoComplete="off"
      className={s.root}
      onFinish={handleFinish}
      form={form}
    >
      <Form.Item label="旧密码" name="oldPassword" rules={[{ required: true, message: '请输入旧密码!' }]}>
        <Input.Password placeholder="请输入旧密码" />
      </Form.Item>

      <Form.Item label="新密码" name="newPassword" rules={[{ required: true, message: '请输入新密码!' }]}>
        <Input.Password placeholder="请输入新密码" />
      </Form.Item>

      <Form.Item
        label="确认密码"
        name="newPasswordConfirm"
        rules={[
          { required: true, message: '请输入确认密码!' },
          {
            async validator(_rule, value) {
              if (value && value !== form.getFieldValue('newPassword')) {
                throw new Error('两次输入的密码不一致!');
              }
            },
          },
        ]}
        dependencies={['newPassword']}
      >
        <Input.Password placeholder="请输入确认密码" />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6 }}>
        <Button htmlType="submit" type="primary" loading={loading}>
          重置密码
        </Button>
      </Form.Item>
    </Form>
  );
};
