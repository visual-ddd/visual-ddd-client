import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { useRef } from 'react';

import { getLayout } from '@/modules/layout';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';

type TableListItem = {
  /**
   * 账号
   */
  accountNo: string;
  accountRole: number;
  createBy: string;
  createTime: string;
  description: string;
  icon: string;
  id: number;
  updateBy: string;
  updateTime: string;
  /**
   * 用户名
   */
  userName: string;
};

export default function User() {
  const actionRef = useRef<ActionType>();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit();
  };

  /**
   * 关闭弹窗
   */
  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
    console.log('取消');
  };

  /**
   * 编辑
   */
  const handleEdit = (record: TableListItem) => {
    setIsAdd(false);
    form.setFieldsValue({ ...record });
    setOpen(true);
    console.log('编辑', record);
  };

  /**
   * 删除
   */
  const handleDelete = (record: TableListItem) => {
    console.log('删除', record);
  };

  /**
   * 新增
   */
  const handleAdd = () => {
    console.log('新增');
    setIsAdd(true);
    setOpen(true);
  };

  /**
   * 提交表单
   * @param values
   */
  const onFinish = (values: any) => {
    console.log('Success:', values);
    setConfirmLoading(true);
    setTimeout(() => {
      handleCancel();
      setConfirmLoading(false);
    }, 2000);
  };

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '用户名',
      dataIndex: 'userName',
      ellipsis: true,
    },
    {
      title: '邮箱',
      dataIndex: 'accountNo',
      hideInSearch: true,
    },

    {
      title: '创建时间',
      dataIndex: 'createTime',
      hideInSearch: true,
    },

    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record, index, action) => [
        <Button type="link" key="deleteTable" onClick={() => handleDelete(record)}>
          删除
        </Button>,
        <Button type="link" key="editTable" onClick={() => handleEdit(record)}>
          编辑
        </Button>,
      ],
    },
  ];

  return (
    <>
      <ProTable<TableListItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}, sort, filter) => {
          console.log(params, sort, filter);

          const data: TableListItem[] = [
            {
              accountNo: '123@wakedata.com',
              accountRole: 0,
              createBy: '',
              createTime: '2023-02-02 12:12:12',
              description: '',
              icon: '',
              id: 0,
              updateBy: '',
              updateTime: '',
              userName: '张三',
            },
          ];
          return Promise.resolve({
            data,
            success: true,
          });
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        pagination={{
          pageSize: 5,
          onChange: page => console.log(page),
        }}
        toolBarRender={() => [
          <Button key="button" type="primary" onClick={handleAdd}>
            创建用户
          </Button>,
        ]}
      ></ProTable>

      <Modal
        title={isAdd ? '新增用户' : '编辑用户'}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText="保存"
      >
        <Form
          name="form"
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item label="用户名" name="userName" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="名称" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="accountNo"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式错误' },
            ]}
          >
            <Input placeholder="邮箱，必须唯一" />
          </Form.Item>

          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

User.getLayout = getLayout;
User.pageTitle = '用户管理';
