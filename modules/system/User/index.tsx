import React, { useState } from 'react';
import { Button, Form, Input, message, Modal, Popconfirm } from 'antd';
import { useRef } from 'react';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { request } from '@/modules/backend-client';
import { useLayoutTitle } from '@/modules/Layout';

import { UserItem } from '../types';

export * from './UserSelect';

export function User() {
  const actionRef = useRef<ActionType>();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentId, setCurrentId] = useState<UserItem['id']>();
  const [form] = Form.useForm();

  useLayoutTitle('用户管理');

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
  const handleEdit = (record: UserItem) => {
    setCurrentId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  /**
   * 删除
   */
  const handleDelete = async (record: UserItem) => {
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

  const columns: ProColumns<UserItem>[] = [
    {
      title: '用户名',
      dataIndex: 'userName',
      ellipsis: true,
      valueType: 'text',
      fieldProps: {
        placeholder: '用户名搜索',
      },
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
      width: 150,
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
      <ProTable<UserItem>
        columns={columns}
        actionRef={actionRef}
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
            throw err;
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
        width={400}
      >
        <Form
          name="form"
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 15 }}
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

export default User;
