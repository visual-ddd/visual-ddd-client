import { Form, Input } from 'antd';
import { UserSelect } from '@/modules/system/User';

import { TeamCreatePayload } from '../types';
import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface BaseInfoProps {
  initialValue?: TeamCreatePayload;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface BaseInfoRef {
  getValues(): Promise<TeamCreatePayload>;
}

export function useBaseInfo() {
  return useRef<BaseInfoRef>(null);
}

/**
 * 基本信息
 * @param BaseInfoProps
 * @returns
 */
export const BaseInfo = forwardRef((props: BaseInfoProps, ref) => {
  const { initialValue, children, ...other } = props;
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => {
    return {
      getValues() {
        return form.validateFields();
      },
    };
  });

  return (
    <Form
      name="form"
      form={form}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 15 }}
      autoComplete="off"
      initialValues={initialValue}
      {...other}
    >
      <Form.Item label="团队名称" name="name" rules={[{ required: true, message: '请输入团队名称' }]}>
        <Input placeholder="名称" />
      </Form.Item>

      <Form.Item label="描述" name="description">
        <Input.TextArea rows={4} placeholder="描述" />
      </Form.Item>

      <Form.Item name="teamManagerId" label="管理员" rules={[{ required: true, message: '请选择管理员' }]}>
        <UserSelect placeholder="搜索用户" />
      </Form.Item>
      {children}
    </Form>
  );
});

BaseInfo.displayName = 'BaseInfo';
