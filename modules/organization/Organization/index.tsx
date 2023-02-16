import { Button, message, Popconfirm } from 'antd';
import { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { request } from '@/modules/backend-client';
import { useRouter } from 'next/router';

import { TeamDetail } from '../types';
import { CreateTeam, useCreateTeam } from './CreateTeam';
import { UpdateTeam, useUpdateTeam } from './UpdateTeam';
import { useLayoutTitle } from '@/modules/Layout';

/**
 * 组织管理
 * @returns
 */
export function Organization() {
  const router = useRouter();
  const organizationId = router.query.id as string;
  const actionRef = useRef<ActionType>();
  const updateRef = useUpdateTeam();
  const createRef = useCreateTeam();

  useLayoutTitle('团队管理');

  /**
   * 编辑
   */
  const handleEdit = (record: TeamDetail) => {
    updateRef.current?.open(record);
  };

  /**
   * 删除
   */
  const handleDelete = async (record: TeamDetail) => {
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
    createRef.current?.open();
  };

  const handleReload = () => {
    actionRef.current?.reload();
  };

  const columns: ProColumns<TeamDetail>[] = [
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

  return (
    <>
      <ProTable<TeamDetail>
        columns={columns}
        actionRef={actionRef}
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
            throw err;
          }
        }}
      ></ProTable>
      <CreateTeam ref={createRef} organizationId={organizationId} onCreated={handleReload} />
      <UpdateTeam ref={updateRef} onFinish={handleReload} />
    </>
  );
}

export default Organization;
