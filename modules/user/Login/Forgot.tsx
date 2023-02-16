import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';

import { request } from '@/modules/backend-client';
import { useTimeout } from '@/lib/hooks';

import { Layout } from './Layout';

export function Forgot() {
  const [sending, setSending] = useState(false);
  const { count, start } = useTimeout();

  // 重置密码
  const handleReset = async (values: any) => {
    try {
      setSending(true);
      const payload = { accountNo: values.accountNo };
      await request.requestByPost('/wd/visual/web/account/account-password-reset-send.email', payload);
      message.success('重置链接发送成功');
      start(90);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title="忘记密码">
      <Form name="loginForm" onFinish={handleReset} layout="vertical" requiredMark={false} size="middle">
        <Layout.H1>忘记密码？</Layout.H1>
        <div className="u-gray-500 u-fs-6">我们会将密码重置链接发送到您的邮箱</div>

        <Form.Item
          name="accountNo"
          rules={[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '邮箱格式错误' },
          ]}
        >
          <Input placeholder="输入邮箱" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={sending} disabled={count > 0}>
            发送重置链接 {count > 0 ? `(${count}s)` : ''}
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
}
