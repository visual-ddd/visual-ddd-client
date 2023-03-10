import { Button, Form, Input, message, Space } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { request } from '@/modules/backend-client';
import classNames from 'classnames';
import {} from '@wakeapp/hooks';
import { useTimeout } from '@/lib/hooks';
import { useRouter } from 'next/router';

import { Layout } from './Layout';
import s from './Register.module.scss';

interface RegisterPayload {
  accountNo: string;
  code: string;
  icon: string;
  password: string;
  userName: string;
  passwordConfirm: string;
}

/**
 * 注册
 * @returns
 */
export function Register() {
  const router = useRouter();
  const [form] = Form.useForm<RegisterPayload>();
  const [codeSending, setCodeSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const { count, start } = useTimeout();
  const codeWaiting = count > 0;

  // 注册
  const handleRegister = async (values: any) => {
    try {
      setSaving(true);
      await request.requestByPost('/wd/visual/web/account/account-register', values);
      message.success('注册成功');
      router.replace('/login');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // 获取验证码
  const handleGetCode = async () => {
    const { accountNo } = await form.validateFields(['accountNo']);

    try {
      setCodeSending(true);
      await request.requestByPost('/wd/visual/web/account/account-send.email', { accountNo });

      // 开始等待
      message.success('验证码发送成功');
      start(90);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setCodeSending(false);
    }
  };

  return (
    <Layout title="注册使用">
      <Form
        name="registerForm"
        form={form}
        className={classNames(s.register)}
        onFinish={handleRegister}
        layout="vertical"
        size="middle"
        requiredMark={false}
      >
        <Layout.H1>欢迎注册使用 Visual DDD</Layout.H1>
        <Form.Item name="userName" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
          <Input placeholder="输入昵称" autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="accountNo"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式错误' },
          ]}
        >
          <Input placeholder="输入邮箱" autoComplete="username" />
        </Form.Item>

        <Form.Item label="验证码">
          <Form.Item noStyle name="code" rules={[{ required: true, message: '请输入验证码' }]}>
            <Input placeholder="输入验证码" className={s.code} autoComplete="off" />
          </Form.Item>

          <Button
            type="primary"
            className={s.codeBtn}
            onClick={handleGetCode}
            loading={codeSending}
            disabled={codeWaiting}
          >
            {codeWaiting ? `${count} 秒` : '验证码'}
          </Button>
        </Form.Item>

        <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
          <Input type="password" placeholder="输入密码" autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          name="passwordConfirm"
          label="确认密码"
          dependencies={['password']}
          rules={[
            { required: true, message: '请输入确认密码!' },
            ({ getFieldValue }) => ({
              async validator(_, value) {
                if (value && getFieldValue('password') !== value) {
                  throw new Error('您输入的两个密码不匹配');
                }
              },
            }),
          ]}
        >
          <Input type="password" placeholder="输入确认密码" autoComplete="new-password" />
        </Form.Item>

        <Space className="u-fw u-mt-sm" direction="vertical">
          <Button type="primary" htmlType="submit" className={s.submit} block loading={saving}>
            注册
          </Button>
          <Link href="/login">
            <Button type="link" block>
              已有账号？登录
            </Button>
          </Link>
        </Space>
      </Form>
    </Layout>
  );
}
