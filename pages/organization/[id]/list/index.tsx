import React, { useState } from 'react';
import { Button, Form, Input, Modal, Select } from 'antd';
import { useRef } from 'react';

import { getLayout } from '@/modules/layout';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';

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
              createBy: '',
              createTime: '2023-02-02 12:12:12',
              description: '',
              id: 0,
              name: '组织名称',
              organizationManagerId: 0,
              organizationManagerName: '123@wakedata.com',
              updateBy: '',
              updateTime: '',
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
            创建组织
          </Button>,
        ]}
      ></ProTable>

      <Modal
        title={isAdd ? '新增组织' : '编辑组织'}
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
              <Select.Option value={0}>张三</Select.Option>
              <Select.Option value={1}>李四</Select.Option>
              <Select.Option value={2}>王五</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

OrganizationList.getLayout = getLayout;
OrganizationList.pageTitle = '组织管理';
