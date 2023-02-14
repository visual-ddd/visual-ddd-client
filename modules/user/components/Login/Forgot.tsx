import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { request } from '@/modules/backend-client';

import { Logo } from '../Logo';
import s from './index.module.scss';

export function Forgot() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const code = router.query.code as string | undefined;
  const userId = router.query.userId as string | undefined;
  const isChangePassword = !!code && !!userId;

  // 重置密码
  const handleReset = async (values: any) => {
    setLoading(true);
    try {
      const api = isChangePassword
        ? '/wd/visual/web/account/account-password-reset'
        : '/wd/visual/web/account/account-email-send';
      const params = isChangePassword
        ? { newPassword: values.newPassword, uuid: code }
        : { accountNo: values.accountNo };
      await request.requestByPost(api, params);
      message.success(isChangePassword ? '密码重置成功' : '重置链接发送成功');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form name="loginForm" className={s.login} onFinish={handleReset} layout="vertical" requiredMark={false}>
      <Form.Item>
        <Logo />
      </Form.Item>
      {isChangePassword ? (
        <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码!' }]}>
          <Input type="password" placeholder="输入新密码" />
        </Form.Item>
      ) : (
        <Form.Item
          name="accountNo"
          label="账号"
          rules={[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '邮箱格式错误' },
          ]}
        >
          <Input placeholder="输入邮箱" />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" className={s.submit} block loading={loading}>
          {isChangePassword ? '确定' : '发送重置链接'}
        </Button>
      </Form.Item>
    </Form>
  );
}
