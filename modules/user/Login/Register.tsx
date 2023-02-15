import { Button, Form, Input, message } from 'antd';
import Link from 'next/link';
import { useState } from 'react';

import { request } from '@/modules/backend-client';

import { Logo } from '../Logo';
import s from './index.module.scss';

/**
 * 注册
 * @returns
 */
export function Register() {
  const [form] = Form.useForm();
  const [codeLoading, setCodeLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // 注册
  const handleRegister = async (values: any) => {
    console.log(values);
    setFormLoading(true);
    try {
      await request.requestByPost('/wd/visual/web/account/account-register', values);
      message.success('注册成功');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setFormLoading(false);
    }
  };

  // 获取验证码
  const getCode = () => {
    form.validateFields(['accountNo']).then(async values => {
      setCodeLoading(true);
      try {
        await request.requestByPost('/wd/visual/web/account/account-send.email', values);
        message.success('验证码发送成功');
      } catch (err) {
        message.error((err as Error).message);
      } finally {
        setCodeLoading(false);
      }
    });
  };

  return (
    <Form
      name="registerForm"
      form={form}
      className={s.login}
      onFinish={handleRegister}
      layout="vertical"
      size="middle"
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

      <Form.Item name="userName" label="用户名" rules={[{ required: true, message: '请输入用户名!' }]}>
        <Input placeholder="输入用户名" />
      </Form.Item>

      <Form.Item label="验证码">
        <Form.Item noStyle name="code" rules={[{ required: true, message: '请输入验证码!' }]}>
          <Input placeholder="输入验证码" className={s.code} />
        </Form.Item>

        <Button type="primary" className={s.codeBtn} onClick={getCode} loading={codeLoading}>
          验证码
        </Button>
      </Form.Item>

      <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码!' }]}>
        <Input type="password" placeholder="输入密码" />
      </Form.Item>

      <Form.Item
        name="affirmPassword"
        label="确认密码"
        dependencies={['password']}
        rules={[
          { required: true, message: '请输入确认密码!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('您输入的两个密码不匹配!'));
            },
          }),
        ]}
      >
        <Input type="password" placeholder="输入确认密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className={s.submit} block loading={formLoading}>
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
