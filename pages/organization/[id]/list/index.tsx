import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Popconfirm, Select } from 'antd';
import { useRef } from 'react';

import { getLayout } from '@/modules/layout';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { request } from '@/modules/backend-client';
import { UserListItem } from '@/pages/system/user';

type TableListItem = {
  /**
   * 组织名称
   */
  name: string;
  id: number;
  createBy: string;
  createTime: string;
  description: string;
  /**
   * 组织管理员ID(账号ID)
   */
  organizationManagerId: number;
  organizationManagerName: string;
  updateBy: string;
  updateTime: string;
};
export default function OrganizationList() {
  const actionRef = useRef<ActionType>();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentId, setCurrentId] = useState<TableListItem['id']>();
  const [form] = Form.useForm();
  const [userList, setUserList] = useState<UserListItem[]>([]);

  useEffect(() => {
    getUserList();
  }, []);

  /**
   * 管理员列表
   */
  const getUserList = async () => {
    try {
      const { data } = await request.requestPaginationByGet('/wd/visual/web/account/account-page-query', {
        pageNo: 1,
        pageSize: 9999,
      });
      setUserList(data);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

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
  const handleEdit = (record: TableListItem) => {
    setCurrentId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  /**
   * 删除
   */
  const handleDelete = async (record: TableListItem) => {
    try {
      await request.requestByPost('/wd/visual/web/organization/organization-remove', { id: record.id });
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
      const api = currentId
        ? '/wd/visual/web/organization/organization-update'
        : '/wd/visual/web/organization/organization-create';
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

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '组织名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '管理员',
      dataIndex: 'organizationManagerName',
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
      <ProTable<TableListItem>
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
            创建组织
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
              '/wd/visual/web/organization/organization-page-query',
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
        title={currentId ? '编辑组织' : '新增组织'}
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
          <Form.Item label="组织名称" name="name" rules={[{ required: true, message: '请输入组织名称' }]}>
            <Input placeholder="名称" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea rows={4} placeholder="描述" />
          </Form.Item>

          <Form.Item name="organizationManagerId" label="管理员" rules={[{ required: true, message: '请选择管理员' }]}>
            <Select placeholder="请选择管理员">
              {userList.map(item => (
                <Select.Option key={item.id} value={item.id}>
                  {item.userName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

OrganizationList.getLayout = getLayout;
OrganizationList.pageTitle = '组织管理';
