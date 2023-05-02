import { Button, message, Popconfirm } from 'antd';
import { useRef } from 'react';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { request } from '@/modules/backend-client';
import { useLayoutTitle } from '@/modules/Layout';

import { UserDetail } from '../types';
import { CreateUser, useCreateUser } from './Create';
import { UpdateUser, useUpdateUser } from './Update';
import { useSession } from '@/modules/session';
import { ReChargeModal, useReChargeModalRef } from '@/modules/user/Wallet/ReCharge';

export * from './UserSelect';

export function User() {
  const actionRef = useRef<ActionType>();
  const createRef = useCreateUser();
  const updateRef = useUpdateUser();
  const rechargeModalRef = useReChargeModalRef();

  const { session } = useSession();
  useLayoutTitle('用户管理');

  const handleRefresh = () => {
    actionRef.current?.reload();
  };

  /**
   * 删除
   */
  const handleDelete = async (record: UserDetail) => {
    try {
      await request.requestByPost('/wd/visual/web/account/account-delete', { id: record.id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const columns: ProColumns<UserDetail>[] = [
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
        <Button type="link" key="editTable" onClick={() => updateRef.current?.open(record)}>
          编辑
        </Button>,
        session?.user.isAdmin && (
          <Button type="link" key="charger" onClick={() => rechargeModalRef.current?.open(record.id)}>
            充值
          </Button>
        ),
      ],
    },
  ];

  return (
    <>
      <ProTable<UserDetail>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" type="primary" onClick={() => createRef.current?.open()}>
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

      <CreateUser ref={createRef} onFinish={handleRefresh} />
      <UpdateUser ref={updateRef} onFinish={handleRefresh} />
      <ReChargeModal ref={rechargeModalRef}></ReChargeModal>
    </>
  );
}

export default User;
