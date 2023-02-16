import { request } from '@/modules/backend-client';
import { Form, Input, message, Modal } from 'antd';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface CreateUserProps {
  onFinish(): void;
}

export interface CreateUserRef {
  open(): void;
}

interface CreateUserPayload {
  accountNo: string;
  icon?: string;
  password: string;
  userName: string;
}

export function useCreateUser() {
  return useRef<CreateUserRef>(null);
}

export const CreateUser = forwardRef<CreateUserRef, CreateUserProps>((props, ref) => {
  const { onFinish } = props;
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleCancel = () => {
    setVisible(false);
  };

  const handleOk = () => {
    form.submit();
  };

  /**
   * 提交表单
   * @param values
   */
  const handleFinish = async (values: CreateUserPayload) => {
    try {
      setSaving(true);

      await request.requestByPost('/wd/visual/web/account/account-create', values);

      message.success('创建成功');
      setVisible(false);
      onFinish();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      open() {
        form.resetFields();
        setVisible(true);
      },
    };
  });

  return (
    <Modal
      title="新增用户"
      open={visible}
      onOk={handleOk}
      confirmLoading={saving}
      onCancel={handleCancel}
      okText="保存"
      width={400}
      destroyOnClose
    >
      <Form<CreateUserPayload>
        name="form"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 15 }}
        onFinish={handleFinish}
      >
        <Form.Item label="用户名" name="userName" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input placeholder="名称" autoComplete="off" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="accountNo"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式错误' },
          ]}
        >
          <Input placeholder="邮箱，必须唯一" autoComplete="off" />
        </Form.Item>

        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password placeholder="密码" autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
});

CreateUser.displayName = 'CreateUser';
