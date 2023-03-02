import { Button, Form, Input, message, Space } from 'antd';
import { useEffect, useState } from 'react';
import { request, useCleanRequestCache } from '@/modules/backend-client';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Layout } from './Layout';
import s from './Login.module.scss';

interface LoginPayload {
  accountNo: string;
  password: string;
}

export function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const cleanSWRCache = useCleanRequestCache();
  const from = router.query.from as string | undefined;
  const showFlash = router.query.flash as string | undefined;

  // 登录
  const handleLogin = async (values: LoginPayload) => {
    try {
      setLoading(true);

      await request.requestByPost('/api/login', values);

      const url = new URL('/launch', globalThis.location.href);

      if (from) {
        url.searchParams.set('from', from);
      }

      cleanSWRCache();

      // 登录成功
      router.push(url);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (from && showFlash) {
      message.warning('会话失效，请重新登录');

      // 清理掉 flash 标记
      const url = new URL(router.asPath, globalThis.location.href);
      url.searchParams.delete('flash');
      router.replace(url, undefined, { shallow: true });
    }
  }, [from, showFlash, router]);

  return (
    <Layout title="登录">
      <Form<LoginPayload>
        size="middle"
        className={s.login}
        onFinish={handleLogin}
        layout="vertical"
        requiredMark={false}
      >
        <Layout.H1>欢迎使用 Visual DDD</Layout.H1>

        <Form.Item
          name="accountNo"
          rules={[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '邮箱格式错误' },
          ]}
        >
          <Input placeholder="邮箱" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
          <Input type="password" placeholder="密码" />
        </Form.Item>

        <Form.Item className={s.forgot}>
          <Link href="/forgot" className="u-link">
            忘记密码？
          </Link>
        </Form.Item>

        <Space direction="vertical" className="u-fw u-mb-sm">
          <Button type="primary" htmlType="submit" className={s.submit} block loading={loading} size="large">
            登录
          </Button>
          <Link href="/register">
            <Button type="link" block size="large">
              注册
            </Button>
          </Link>
        </Space>
      </Form>
    </Layout>
  );
}
