import { Button, Form, Input } from 'antd';
import { Logo } from '@/modules/user';
import Link from 'next/link';

import s from './index.module.scss';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();

  // 登录
  const handleLogin = (values: any) => {
    console.log('登录', values);
    router.push('/login/launch');
  };

  return (
    <Form name="loginForm" className={s.login} onFinish={handleLogin} layout="vertical" requiredMark={false}>
      <Form.Item>
        <Logo />
      </Form.Item>

      <Form.Item name="username" label="账号" rules={[{ required: true, message: '请输入邮箱!' }]}>
        <Input placeholder="输入邮箱" />
      </Form.Item>
      <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码!' }]}>
        <Input type="password" placeholder="输入密码" />
      </Form.Item>

      <Form.Item className={s.forgot}>
        <Link href="/login/forgot">
          <Button type="link">忘记密码？</Button>
        </Link>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className={s.submit} block>
          登录
        </Button>
        <Link href="/login/register">
          <Button type="link" block>
            注册
          </Button>
        </Link>
      </Form.Item>
    </Form>
  );
}
