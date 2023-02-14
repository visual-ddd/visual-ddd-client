import React, { useEffect, useState } from 'react';
import { Button, Form, FormInstance, Input, message, Modal, Popconfirm, Select, Tabs, TabsProps } from 'antd';
import { useRef } from 'react';

import { getLayout } from '@/modules/layout';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { DeleteOutlined } from '@ant-design/icons';
import { UserItem } from '@/modules/system/types';
import { MemberType, MemberTypeOption } from '@/modules/user/constants';
import { request } from '@/modules/backend-client';

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
   * 	所属组织ID
   */
  organizationId: number;
  /**
   * 	团队管理员ID(账号id)
   */
  teamManagerId: number;
  /**
   * 	团队管理员名称
   */
  teamManagerName: string;
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
  userList: UserItem[];
}
/**
 * 基本信息
 * @param BaseInfoProps
 * @returns
 */
const BaseInfo = ({ form, onFinish, userList }: BaseInfoProps) => {
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

      <Form.Item name="teamManagerId" label="管理员" rules={[{ required: true, message: '请选择管理员' }]}>
        <Select placeholder="请选择管理员">
          {userList.map(item => (
            <Select.Option key={item.id} value={item.id}>
              {item.userName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};

/**
 * 成员列表
 */
interface TeamMemberListItem {
  accountId: number;
  accountNo: string;
  id: number;
  memberTypeList: MemberType[];
  teamId: number;
  teamMemberName: string;
}
interface TeamMemberProp {
  teamId?: number;
  userList: UserItem[];
}

/**
 * 成员管理
 * @returns
 */
const TeamMember = ({ teamId, userList }: TeamMemberProp) => {
  const [accountId, setAccountId] = useState<number>();
  const TeamActionRef = useRef<ActionType>();

  useEffect(() => {
    TeamActionRef.current?.reload();
  }, [teamId]);

  /**
   * 删除团队成员
   * @param id
   */
  const handleDeleteMember = async (id: React.Key) => {
    try {
      await request.requestByPost('/wd/visual/web/team-member/team-member-remove', {
        id,
      });
      message.success('删除成功');
      TeamActionRef.current?.reload();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  let timer: NodeJS.Timeout;
  /**
   * 绑定团队成员职位
   * @param value
   */
  const handleChangeRole = async (memberTypeList: MemberType[], id: number) => {
    if (timer) {
      clearTimeout(timer);
    }

    try {
      timer = setTimeout(async () => {
        await request.requestByPost('/wd/visual/web/team-member/team-member-role-bind', {
          memberTypeList,
          id,
        });
        TeamActionRef.current?.reload();
      }, 200);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  /**
   * 添加团队成员
   */
  const handleAddMember = async () => {
    if (!accountId) return;
    try {
      await request.requestByPost('/wd/visual/web/team-member/team-member-add', {
        accountId,
        memberTypeList: [],
        teamId,
      });
      message.success('添加成功');
      TeamActionRef.current?.reload();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  /**
   * 选择用户
   * @param value 用户id
   */
  const onChangeAccount = (value: number) => {
    setAccountId(value);
  };

  const columns: ProColumns<TeamMemberListItem>[] = [
    {
      title: '用户',
      dataIndex: 'teamMemberName',
      key: 'teamMemberName',
      width: 150,
    },
    {
      title: '角色',
      dataIndex: 'memberTypeList',
      key: 'memberTypeList',

      render: (_: any, record: TeamMemberListItem) => (
        <Select<MemberType[]>
          placeholder="请选择角色"
          defaultValue={record.memberTypeList || []}
          onChange={value => handleChangeRole(value, record.id)}
          mode="multiple"
          style={{ width: '100%' }}
        >
          {MemberTypeOption.map(item => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: '',
      dataIndex: 'operation',
      width: 60,
      render: (_: any, record: TeamMemberListItem) => (
        <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteMember(record.id)}></Button>
      ),
    },
  ];

  return (
    <div>
      <ProTable<TeamMemberListItem>
        actionRef={TeamActionRef}
        columns={columns}
        rowKey="id"
        search={false}
        options={false}
        request={async ({ current = 1, pageSize = 20 }) => {
          try {
            const params = {
              teamId,
              pageNo: current,
              pageSize,
            };
            const { success, data, totalCount } = await request.requestPaginationByGet(
              '/wd/visual/web/team-member/team-member-by-team-id-page-query',
              params
            );
            return { success, data, total: totalCount };
          } catch (err) {
            message.error((err as Error).message);
            return {};
          }
        }}
      />
      <div>
        <Select placeholder="用户选择器" className={s.memberSelect} onChange={onChangeAccount}>
          {userList.map(item => (
            <Select.Option key={item.id} value={item.id}>
              {item.userName}
            </Select.Option>
          ))}
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
  const [currentId, setCurrentId] = useState<TableListItem['id']>();
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState(TAB_KEYS.base);
  const [userList, setUserList] = useState<UserItem[]>([]);

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
    setActiveKey(TAB_KEYS.base);
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
      await request.requestByPost('/wd/visual/web/team/team-remove', { id: record.id });
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
      const api = currentId ? '/wd/visual/web/team/team-update' : '/wd/visual/web/team/team-create';
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
      title: '团队名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '管理员',
      dataIndex: 'teamManagerName',
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

  const items: TabsProps['items'] = [
    {
      label: `基本信息`,
      key: TAB_KEYS.base,
      children: <BaseInfo form={form} onFinish={onFinish} userList={userList} />,
    },
    {
      label: `成员管理`,
      key: TAB_KEYS.member,
      children: <TeamMember teamId={currentId} userList={userList} />,
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
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" type="primary" onClick={handleAdd}>
            创建团队
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
              '/wd/visual/web/team/team-page-query',
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
        title={currentId ? '编辑团队' : '新增团队'}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
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
        {currentId ? (
          <Tabs tabPosition="left" items={items} onChange={onTabChange} activeKey={activeKey} />
        ) : (
          <BaseInfo form={form} onFinish={onFinish} userList={userList} />
        )}
      </Modal>
    </>
  );
}

TeamList.getLayout = getLayout;
TeamList.pageTitle = '团队管理';
