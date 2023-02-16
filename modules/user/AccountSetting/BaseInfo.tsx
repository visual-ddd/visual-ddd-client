import { request, useRequestByGet } from '@/modules/backend-client';
import { useSession, VDUser } from '@/modules/session';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Form, Input, message } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

import s from './BaseInfo.module.scss';

/**
 * 基础信息编辑
 * TODO: 支持修改头像
 * @returns
 */
export const BaseInfo = () => {
  const { session, isLoading } = useSession();
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  /**
   * 获取最新的用户信息， useSession 中的用户信息可能是旧的
   */
  const { data: user, isLoading: userLoading } = useRequestByGet<VDUser>(
    session ? `/wd/visual/web/account/account-detail-query?id=${session.user.id}` : null
  );

  const loading = isLoading || saving || userLoading;

  const handleFinish = async (values: VDUser) => {
    const payload = { ...values, id: session?.user.id };

    try {
      setSaving(true);
      await request.requestByPost('/wd/visual/web/account/account-update', payload);
      message.success('已保存');
    } catch (err) {
      message.error(`保存失败: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  return (
    <Form
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      autoComplete="off"
      className={classNames('vd-base-info', s.root)}
      onFinish={handleFinish}
      form={form}
    >
      <div className={classNames('vd-base-info__avatar', s.avatar)}>
        <Avatar size={50} icon={<UserOutlined />} src={user?.icon || session?.user.icon} />
      </div>
      <Form.Item label="用户名" name="userName" rules={[{ required: true, message: '请输入用户名!' }]}>
        <Input placeholder="请输入用户名" />
      </Form.Item>

      <Form.Item label="邮箱" name="accountNo">
        <Input className={s.email} placeholder="请输入邮箱" disabled />
      </Form.Item>

      <Form.Item label="描述" name="description">
        <Input.TextArea placeholder="请输入描述" />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6 }}>
        <Button htmlType="submit" type="primary" loading={loading}>
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};
