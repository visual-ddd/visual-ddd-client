import { Button, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { request } from '@/modules/backend-client';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Logo } from '../Logo';
import s from './index.module.scss';

interface LoginPayload {
  accountNo: string;
  password: string;
}

export function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const from = router.query.from as string | undefined;

  // 登录
  const handleLogin = async (values: LoginPayload) => {
    try {
      setLoading(true);

      await request.requestByPost('/api/login', values);

      const url = new URL('/launch', globalThis.location.href);

      if (from) {
        url.searchParams.set('from', from);
      }

      // 登录成功
      router.push(url);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (from) {
      message.warning('会话失效，请重新登录');
    }
  }, [from]);

  return (
    <Form<LoginPayload>
      name="loginForm"
      className={s.login}
      onFinish={handleLogin}
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item>
        <Logo />
      </Form.Item>

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

      <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码!' }]}>
        <Input type="password" placeholder="输入密码" />
      </Form.Item>

      <Form.Item className={s.forgot}>
        <Link href="/forgot">
          <Button type="link">忘记密码？</Button>
        </Link>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className={s.submit} block loading={loading}>
          登录
        </Button>
        <Link href="/register">
          <Button type="link" block>
            注册
          </Button>
        </Link>
      </Form.Item>
    </Form>
  );
}
