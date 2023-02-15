import { useCallback, useRef, useState } from 'react';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { request } from '@/modules/backend-client';
import { UserSelect } from '@/modules/system/User';
import type { UserItem } from '@/modules/system/types';
import classNames from 'classnames';
import { NoopArray } from '@wakeapp/utils';

import { TeamDetail, TeamMemberItem, TeamMemberRole } from '../types';

import s from './TeamMember.module.scss';
import { RoleSelect } from './RoleSelect';

export interface TeamMemberProp {
  detail: TeamDetail;
}

/**
 * 成员管理
 * @returns
 */
export const TeamMember = (props: TeamMemberProp) => {
  const { detail } = props;
  const teamId = detail.id;
  const [adding, setAdding] = useState<number>();
  const tableActionRef = useRef<ActionType>();
  const [list, setList] = useState<TeamMemberItem[]>(NoopArray);

  const addMemberFilter = useCallback(
    (item: UserItem) => {
      return !list.some(i => i.accountId === item.id);
    },
    [list]
  );

  const handleRequest = async () => {
    try {
      const params = {
        teamId,
        pageNo: 1,
        pageSize: 10000,
      };
      const { success, data, totalCount } = await request.requestPaginationByGet<TeamMemberItem>(
        '/wd/visual/web/team-member/team-member-by-team-id-page-query',
        params
      );
      setList(data);
      return { success, data, total: totalCount };
    } catch (err) {
      message.error((err as Error).message);
      return {};
    }
  };

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
      tableActionRef.current?.reload();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  /**
   * 添加团队成员
   */
  const handleAddMember = async () => {
    if (!adding) return;

    try {
      await request.requestByPost('/wd/visual/web/team-member/team-member-add', {
        accountId: adding,
        memberTypeList: [TeamMemberRole.Developer],
        teamId,
      });

      message.success('添加成功');
      setAdding(undefined);
      tableActionRef.current?.reload();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  /**
   * 选择用户
   * @param value 用户id
   */
  const handleChangeAdding = (value: number) => {
    setAdding(value);
  };

  const columns: ProColumns<TeamMemberItem>[] = [
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

      render: (_: any, record: TeamMemberItem) => (
        <RoleSelect
          placeholder="请选择角色"
          value={record.memberTypeList || NoopArray}
          mode="multiple"
          allowClear
          className="u-fw"
          memberId={record.id}
          teamId={teamId}
        />
      ),
    },
    {
      title: '',
      dataIndex: 'operation',
      width: 60,
      render: (_: any, record: TeamMemberItem) => (
        <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDeleteMember(record.id)}></Button>
      ),
    },
  ];

  return (
    <div className={classNames('vd-team-member', s.root)}>
      <ProTable<TeamMemberItem>
        actionRef={tableActionRef}
        columns={columns}
        rowKey="id"
        search={false}
        options={false}
        scroll={{ y: 200 }}
        pagination={false}
        request={handleRequest}
      />
      <div className={classNames('vd-team-member__add', s.add)}>
        <UserSelect
          className={(classNames('vd-team-member-us'), s.userSelect)}
          filter={addMemberFilter}
          placeholder="搜索添加用户"
          onChange={handleChangeAdding}
          value={adding}
        />
        <Button type="primary" onClick={handleAddMember}>
          添加
        </Button>
      </div>
    </div>
  );
};
