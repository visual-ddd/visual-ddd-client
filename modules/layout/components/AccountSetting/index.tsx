import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Form, FormInstance, Input, Modal, Tabs, TabsProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import s from './index.module.scss';

export interface AccountSettingProps {
  open: boolean;
  setOpen: (state: boolean) => void;
}

enum TAB_KEYS {
  /**
   * 基本信息
   */
  base = '1',
  /**
   * 重置密码
   */
  reset = '2',
}

interface ResetFormParams {
  form: FormInstance[];
  open: boolean;
  setActiveKey: (key: TAB_KEYS) => void;
}
// 关闭弹窗重置表单
const useResetFormOnCloseModal = ({ form, open, setActiveKey }: ResetFormParams) => {
  const prevOpenRef = useRef<boolean>();
  useEffect(() => {
    prevOpenRef.current = open;
  }, [open]);
  const prevOpen = prevOpenRef.current;

  useEffect(() => {
    if (!open && prevOpen) {
      form.forEach(f => f.resetFields());
      setActiveKey(TAB_KEYS.base);
    }
  }, [form, prevOpen, open, setActiveKey]);
};

export function AccountSetting(props: AccountSettingProps) {
  const { open, setOpen } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [basicForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [activeKey, setActiveKey] = useState(TAB_KEYS.base);

  useResetFormOnCloseModal({
    form: [basicForm, resetForm],
    open,
    setActiveKey,
  });

  const handleOk = () => {
    if (activeKey === TAB_KEYS.base) {
      basicForm.submit();
    }
    if (activeKey === TAB_KEYS.reset) {
      resetForm.submit();
    }
  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setOpen(false);
  };

  const onBasicFinish = (values: any) => {
    console.log('baseForm:', values);
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };
  const onResetFinish = (values: any) => {
    console.log('resetForm:', values);
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const items: TabsProps['items'] = [
    {
      label: `基本信息`,
      key: TAB_KEYS.base,
      children: (
        <Form
          name="basicForm"
          form={basicForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          autoComplete="off"
          className={s.form}
          onFinish={onBasicFinish}
        >
          <div className={s.avatar}>
            <Avatar size={64} icon={<UserOutlined />} />
          </div>
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item label="邮箱" name="email" rules={[{ message: '请输入邮箱!' }]}>
            <div>
              <Input className={s.email} placeholder="请输入邮箱" disabled />
              <Button type="link">修改</Button>
            </div>
          </Form.Item>

          <Form.Item label="职位" name="job" rules={[{ required: true, message: '请输入职位!' }]}>
            <Input placeholder="请输入职位" />
          </Form.Item>

          <Form.Item label="描述" name="desc">
            <Input placeholder="请输入描述" />
          </Form.Item>
        </Form>
      ),
    },
    {
      label: `重置密码`,
      key: TAB_KEYS.reset,
      children: (
        <Form
          name="resetForm"
          form={resetForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          autoComplete="off"
          className={s.form}
          onFinish={onResetFinish}
        >
          <Form.Item label="旧密码" name="oldPassword" rules={[{ required: true, message: '请输入旧密码!' }]}>
            <Input.Password placeholder="请输入旧密码" />
          </Form.Item>

          <Form.Item label="新密码" name="password" rules={[{ required: true, message: '请输入新密码!' }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item label="确认密码" name="password2" rules={[{ required: true, message: '请输入确认密码!' }]}>
            <Input.Password placeholder="请输入确认密码" />
          </Form.Item>
        </Form>
      ),
    },
  ];

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey as TAB_KEYS);
  };

  return (
    <Modal open={open} onOk={handleOk} confirmLoading={confirmLoading} onCancel={handleCancel} title="账户设置">
      <Tabs tabPosition="left" items={items} onChange={onChange} activeKey={activeKey} />
    </Modal>
  );
}
