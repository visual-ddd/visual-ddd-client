import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Alert, Button, Input, Space, message } from 'antd';
import { request, useRequestByGet } from '@/modules/backend-client';
import s from './Invites.module.scss';

enum InviteStatus {
  /**
   * 已注册
   */
  REGISTERED = 0,
  /**
   * 已奖励
   */
  AWARDED = 1,
}

/**
 * 邀请记录
 */
interface InviteRecord {
  id: number;
  invitationStatus: InviteStatus;
  // 被邀请人
  invitee: number;
  inviteeName: string;
  inviter: number;
  inviterName: string;
  createTime: string;
  description: string;
}

const columns: ProColumns<InviteRecord>[] = [
  {
    title: '用户',
    dataIndex: 'inviteeName',
  },
  {
    title: '邀请时间',
    dataIndex: 'createTime',
  },
  {
    title: '状态',
    render(_, record) {
      return record.invitationStatus === InviteStatus.REGISTERED ? '已注册' : '已完成';
    },
  },
  {
    title: '备注',
    dataIndex: 'description',
  },
];

/**
 * 邀请码
 * @returns
 */
export const Invites = () => {
  const { data: code, isLoading, error } = useRequestByGet('/api/create-invite-code');

  const link = code && `${window.location.origin}/register?i=${code}`;

  const handleCopy = () => {
    if (link) {
      window.navigator.clipboard.writeText(link);
      message.success('邀请链接复制成功，快去邀请你的好友吧，有奖励哦');
    }
  };

  return (
    <div className={s.root}>
      <header>
        {error && <Alert type="error" message={error.message} banner></Alert>}
        <h3>生成邀请链接</h3>
        <div>
          <Space>
            <Input value={link} readOnly placeholder="点击生成邀请链接" className={s.input}></Input>
            <Button type="primary" onClick={handleCopy} loading={isLoading}>
              复制
            </Button>
          </Space>
        </div>
      </header>
      <main className={s.list}>
        <h3>邀请记录</h3>
        <ProTable<InviteRecord>
          className={s.table}
          columns={columns}
          options={false}
          search={false}
          size="small"
          rowKey="id"
          request={async ({ current = 1, pageSize = 20, ...payload }) => {
            const params = {
              ...payload,
              pageNo: current,
              pageSize,
            };
            const { data, totalCount } = await request.requestByPagination<InviteRecord>(
              '/wd/visual/web/invitation-code/invitation-record-page-query',
              params,
              {
                method: 'GET',
              }
            );
            return {
              success: true,
              total: totalCount,
              data,
            };
          }}
        ></ProTable>
      </main>
    </div>
  );
};
