import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Alert, Button, Input, Space, message } from 'antd';
import { useRequestByGet } from '@/modules/backend-client';
import s from './Invites.module.scss';

/**
 * 邀请记录
 */
interface InviteRecord {
  id: string;
  user: string;
  createDate: string;
  status: string;
  money?: string;
}

const columns: ProColumns<InviteRecord>[] = [
  {
    title: '用户',
  },
  {
    title: '邀请时间',
  },
  {
    title: '状态',
  },
  {
    title: '奖励金额',
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
          request={async () => {
            return {
              success: true,
              total: 0,
              data: [],
            };
          }}
        ></ProTable>
      </main>
    </div>
  );
};
