import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { request } from '@/modules/backend-client';

import { Layout } from './Layout';

interface ResetPasswordPayload {
  accountNo: string;
  newPassword: string;
  uuid: string;
}

export function ResetPassword() {
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const code = router.query.code as string | undefined;
  const userId = router.query.userId as string | undefined;

  if (router.isReady && (code == null || userId == null)) {
    router.replace('/403');
  }

  // 重置密码
  const handleReset = async (values: ResetPasswordPayload) => {
    try {
      setSending(true);
      const payload = {
        ...values,
        uuid: code,
        accountNo: userId,
      };
      await request.requestByPost('/wd/visual/web/account/account-password-reset', payload);
      message.success('密码重置成功');
      router.replace('/login');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title="重置密码">
      <Form name="loginForm" onFinish={handleReset} layout="vertical" requiredMark={false} size="middle">
        <Layout.H1>设置新密码</Layout.H1>

        <Form.Item name="newPassword" rules={[{ required: true, message: '请输入密码!' }]}>
          <Input type="password" placeholder="输入新密码" />
        </Form.Item>

        <Form.Item
          name="passwordConfirm"
          rules={[
            { required: true, message: '请输入确认密码!' },
            ({ getFieldValue }) => ({
              async validator(_, value) {
                if (value && getFieldValue('newPassword') !== value) {
                  throw new Error('您输入的两个密码不匹配');
                }
              },
            }),
          ]}
        >
          <Input type="password" placeholder="输入确认密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={sending}>
            立即修改
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
}
