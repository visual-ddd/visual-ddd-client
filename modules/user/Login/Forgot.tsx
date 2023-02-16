import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { request } from '@/modules/backend-client';

import { Layout } from './Layout';

export function Forgot() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const code = router.query.code as string | undefined;
  const userId = router.query.userId as string | undefined;

  const isResetPassword = !!code && !!userId;

  // 重置密码
  const handleReset = async (values: any) => {
    setLoading(true);
    try {
      const api = isResetPassword
        ? '/wd/visual/web/account/account-password-reset'
        : '/wd/visual/web/account/account-email-send';
      const params = isResetPassword
        ? { newPassword: values.newPassword, uuid: code }
        : { accountNo: values.accountNo };
      await request.requestByPost(api, params);
      message.success(isResetPassword ? '密码重置成功' : '重置链接发送成功');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isResetPassword ? '重置密码' : '忘记密码'}>
      <Form name="loginForm" onFinish={handleReset} layout="vertical" requiredMark={false} size="middle">
        <Layout.H1>{isResetPassword ? '设置新密码' : '忘记密码？'}</Layout.H1>

        {isResetPassword ? (
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码!' }]}>
            <Input type="password" placeholder="输入新密码" />
          </Form.Item>
        ) : (
          <Form.Item
            name="accountNo"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '邮箱格式错误' },
            ]}
          >
            <Input placeholder="输入邮箱" />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {isResetPassword ? '确定' : '发送重置链接'}
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
}
