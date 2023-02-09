import { Button, Form, Input } from 'antd';
import Link from 'next/link';

import { Logo } from '../Logo';
import s from './index.module.scss';

/**
 * 注册
 * @returns
 */
export function Register() {
  // 注册
  const handleRegister = (values: any) => {
    console.log('Received values of form: ', values);
  };

  // 获取验证码
  const getCode = () => {
    console.log('获取验证码');
  };

  return (
    <Form name="registerForm" className={s.login} onFinish={handleRegister} layout="vertical" requiredMark={false}>
      <Form.Item>
        <Logo />
      </Form.Item>

      <Form.Item name="username" label="账号" rules={[{ required: true, message: '请输入邮箱!' }]}>
        <Input placeholder="输入邮箱" />
      </Form.Item>

      <Form.Item label="验证码">
        <Form.Item noStyle name="code" rules={[{ required: true, message: '请输入验证码!' }]}>
          <Input placeholder="输入验证码" className={s.code} />
        </Form.Item>

        <Button type="primary" className={s.codeBtn} onClick={getCode}>
          验证码
        </Button>
      </Form.Item>

      <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码!' }]}>
        <Input type="password" placeholder="输入密码" />
      </Form.Item>

      <Form.Item name="password2" label="确认密码" rules={[{ required: true, message: '请输入密码!' }]}>
        <Input type="password" placeholder="输入密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className={s.submit} block>
          注册
        </Button>
        <Link href="/login">
          <Button type="link" block>
            登录
          </Button>
        </Link>
      </Form.Item>
    </Form>
  );
}
