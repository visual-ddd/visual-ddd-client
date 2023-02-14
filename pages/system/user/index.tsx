import React, { useState } from 'react';
import { Button, Form, Input, message, Modal, Popconfirm } from 'antd';
import { useRef } from 'react';

import { getLayout } from '@/modules/layout';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { request } from '@/modules/backend-client';

export type UserListItem = {
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
  const [currentId, setCurrentId] = useState<UserListItem['id']>();
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit();
  };

  /**
   * 关闭弹窗
   */
  const handleCancel = () => {
    setOpen(false);
    setCurrentId(undefined);
    form.resetFields();
  };

  /**
   * 编辑
   */
  const handleEdit = (record: UserListItem) => {
    setCurrentId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  /**
   * 删除
   */
  const handleDelete = async (record: UserListItem) => {
    try {
      await request.requestByPost('/wd/visual/web/account/account-delete', { id: record.id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  /**
   * 新增
   */
  const handleAdd = () => {
    setOpen(true);
  };

  /**
   * 提交表单
   * @param values
   */
  const onFinish = async (values: any) => {
    setConfirmLoading(true);
    try {
      const api = currentId ? '/wd/visual/web/account/account-update' : '/wd/visual/web/account/account-create';
      await request.requestByPost(api, { ...values, id: currentId });
      message.success('操作成功');
      handleCancel();
      actionRef.current?.reload();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns: ProColumns<UserListItem>[] = [
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
        <Popconfirm
          key="deleteTable"
          title="删除"
          description="确认删除?"
          onConfirm={() => handleDelete(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link">删除</Button>
        </Popconfirm>,
        <Button type="link" key="editTable" onClick={() => handleEdit(record)}>
          编辑
        </Button>,
      ],
    },
  ];

  return (
    <>
      <ProTable<UserListItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" type="primary" onClick={handleAdd}>
            创建用户
          </Button>,
        ]}
        request={async ({ current = 1, pageSize = 20, ...payload }) => {
          try {
            const params = {
              ...payload,
              pageNo: current,
              pageSize,
            };
            const { success, data, totalCount } = await request.requestPaginationByGet(
              '/wd/visual/web/account/account-page-query',
              params
            );
            return { success, data, total: totalCount };
          } catch (err) {
            message.error((err as Error).message);
            return {};
          }
        }}
      ></ProTable>

      <Modal
        title={currentId ? '编辑用户' : '新增用户'}
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

          {!currentId && (
            <>
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
            </>
          )}
        </Form>
      </Modal>
    </>
  );
}

User.getLayout = getLayout;
User.pageTitle = '用户管理';
