import { Button, Form, Input } from 'antd';

import { Logo } from '../Logo';
import s from './index.module.scss';

export function Forgot() {
  // 重置密码
  const handleReset = (values: any) => {
    console.log('重置密码', values);
  };

  return (
    <Form name="loginForm" className={s.login} onFinish={handleReset} layout="vertical" requiredMark={false}>
      <Form.Item>
        <Logo />
      </Form.Item>

      <Form.Item name="username" label="账号" rules={[{ required: true, message: '请输入邮箱!' }]}>
        <Input placeholder="输入邮箱" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className={s.submit} block>
          发送重置链接
        </Button>
      </Form.Item>
    </Form>
  );
}
