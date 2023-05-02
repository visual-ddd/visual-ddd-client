import { toYuan } from '@/lib/utils';
import { useRequestByGet } from '@/modules/backend-client';
import { useSession } from '@/modules/session';
import { Spin, Statistic } from 'antd';
import { useMemo } from 'react';
import s from './Balance.module.scss';

interface IBalanceProps {
  userId?: Number;
  title?: JSX.Element | string;
}

export const Balance = (props: IBalanceProps) => {
  const { session } = useSession();

  const userId = props.userId ?? session?.user.id;

  const { data: balanceInfo, isLoading } = useRequestByGet<{
    creditBalance: number;
  }>(session ? '/wd/visual/web/balance/balance-account-query?id=' + userId : null);

  const userBalance = useMemo(() => {
    return toYuan(balanceInfo?.creditBalance || 0);
  }, [balanceInfo?.creditBalance]);

  const title = useMemo(() => {
    return props.title || <span className={s.title}>当前余额</span>;
  }, [props.title]);

  return (
    <div className={s.balance}>
      <Spin spinning={isLoading}>
        <Statistic title={title} value={userBalance} prefix="￥" />
      </Spin>
    </div>
  );
};
