import React, { useState } from 'react';
import { Button, Form, FormInstance, Input, Modal, Select, Table, TableProps, Tabs, TabsProps } from 'antd';
import { useRef } from 'react';

import { getLayout } from '@/modules/layout';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { DeleteOutlined } from '@ant-design/icons';

import s from './index.module.scss';

type TableListItem = {
  /**
   * 团队名称
   */
  name: string;
  id: number;
  createBy: string;
  createTime: string;
  description: string;
  /**
   * 团队管理员ID(账号ID)
   */
  organizationManagerId: number;
  organizationManagerName: string;
  updateBy: string;
  updateTime: string;
};

enum TAB_KEYS {
  /**
   * 基本信息
   */
  base = 'base',
  /**
   * 成员管理
   */
  member = 'member',
}

interface BaseInfoProps {
  form: FormInstance;
  onFinish: (values: any) => void;
}
/**
 * 基本信息
 * @param BaseInfoProps
 * @returns
 */
const BaseInfo = ({ form, onFinish }: BaseInfoProps) => {
  return (
    <Form
      name="form"
      form={form}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item label="团队名称" name="name" rules={[{ required: true, message: '请输入团队名称' }]}>
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
  );
};

/**
 * 成员列表
 */
interface MemberListItem {
  accountId: number;
  accountNo: string;
  id: number;
  memberTypeList: number[];
  teamId: number;
}
/**
 * 成员管理
 * @returns
 */
const Member = () => {
  const handleDeleteMember = (id: React.Key) => {
    const newData = dataSource.filter(item => item.id !== id);
    setDataSource(newData);
  };

  const [dataSource, setDataSource] = useState<MemberListItem[]>([
    {
      id: 0,
      accountId: 0,
      accountNo: '张三',
      memberTypeList: [1, 2, 3],
      teamId: 0,
    },
    {
      id: 1,
      accountId: 1,
      accountNo: '李四',
      memberTypeList: [1, 3],
      teamId: 1,
    },
  ]);

  const columns: TableProps<MemberListItem>['columns'] = [
    {
      title: '用户',
      dataIndex: 'accountNo',
      key: 'accountNo',
      width: 150,
    },
    {
      title: '角色',
      dataIndex: 'memberTypeList',
      key: 'memberTypeList',

      render: (_: any, record: MemberListItem) => (
        <Select
          placeholder="请选择角色"
          defaultValue={record.memberTypeList}
          onChange={handleChangeRole}
          mode="multiple"
          style={{ width: '100%' }}
        >
          <Select.Option value={0}>张三</Select.Option>
          <Select.Option value={1}>李四</Select.Option>
          <Select.Option value={2}>王五</Select.Option>
        </Select>
      ),
    },
    {
      title: '',
      dataIndex: 'operation',
      width: 60,
      render: (_: any, record: MemberListItem) => (
        <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteMember(record.id)}></Button>
      ),
    },
  ];

  const handleChangeRole = (value: number[]) => {
    console.log(`selected ${value}`);
  };

  const handleAddMember = () => {
    const newData: MemberListItem = {
      id: dataSource.length,
      accountId: dataSource.length,
      accountNo: '张三' + dataSource.length,
      memberTypeList: [1, 2, 3],
      teamId: dataSource.length,
    };
    setDataSource([...dataSource, newData]);
  };

  return (
    <div>
      <Table dataSource={dataSource} columns={columns} rowKey="id" />
      <div>
        <Select placeholder="用户选择器" className={s.memberSelect}>
          <Select.Option value={0}>张三</Select.Option>
          <Select.Option value={1}>李四</Select.Option>
          <Select.Option value={2}>王五</Select.Option>
        </Select>
        <Button onClick={handleAddMember}>添加</Button>
      </div>
    </div>
  );
};

export default function TeamList() {
  const actionRef = useRef<ActionType>();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState(TAB_KEYS.base);

  const handleOk = () => {
    form.submit();
  };

  /**
   * 关闭弹窗
   */
  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
    setActiveKey(TAB_KEYS.base);
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
      title: '团队名称',
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

  const items: TabsProps['items'] = [
    {
      label: `基本信息`,
      key: TAB_KEYS.base,
      children: <BaseInfo form={form} onFinish={onFinish} />,
    },
    {
      label: `成员管理`,
      key: TAB_KEYS.member,
      children: <Member />,
    },
  ];

  const onTabChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey as TAB_KEYS);
  };

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
              name: '团队名称',
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
            创建团队
          </Button>,
        ]}
      ></ProTable>

      <Modal
        title={isAdd ? '新增团队' : '编辑团队'}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        footer={
          <>
            <Button key="back" onClick={handleCancel}>
              关闭
            </Button>
            {activeKey !== TAB_KEYS.member && (
              <Button key="submit" type="primary" loading={confirmLoading} onClick={handleOk}>
                保存
              </Button>
            )}
          </>
        }
      >
        {isAdd ? (
          <BaseInfo form={form} onFinish={onFinish} />
        ) : (
          <Tabs tabPosition="left" items={items} onChange={onTabChange} activeKey={activeKey} />
        )}
      </Modal>
    </>
  );
}

TeamList.getLayout = getLayout;
TeamList.pageTitle = '团队管理';
