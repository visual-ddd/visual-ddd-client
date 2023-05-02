import { request } from '@/modules/backend-client';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import s from './FundFlow.module.scss';
import { BalanceChangeStatus, BalanceSourceType } from './enum';
import { toYuan } from '@/lib/utils';

const BalanceChangePrefixMap: Record<BalanceChangeStatus, string> = {
  [BalanceChangeStatus.In]: '+',
  [BalanceChangeStatus.Out]: '- ',
};

interface IBalanceChangeInfo {
  createTime: string;
  balanceChangeStatus: BalanceChangeStatus;
  balanceSourceType: BalanceSourceType;
  changeBalance: number;
  creditBalance: number;
}

const columns: ProColumns<IBalanceChangeInfo>[] = [
  {
    title: '交易时间',
    valueType: 'dateTime',
    dataIndex: 'createTime',
    hideInSearch: true,
  },
  {
    title: '类型',
    dataIndex: 'balanceSourceType',
    valueType: 'select',
    valueEnum: {
      [BalanceSourceType.ManualRecharge]: {
        text: '充值',
      },
      [BalanceSourceType.DistributionRecharge]: {
        text: '分销',
      },
      [BalanceSourceType.MonthlyDeduction]: {
        text: '月度扣费',
      },
      [BalanceSourceType.YearDeduction]: {
        text: '年度扣费',
      },
    },
  },
  {
    title: '交易金额',
    dataIndex: 'changeBalance',
    hideInSearch: true,

    render: (_, item) => {
      const changeStatus = item.balanceChangeStatus;
      return (
        <span className={changeStatus === BalanceChangeStatus.In ? s.green : s.orange}>
          {BalanceChangePrefixMap[changeStatus]}￥{toYuan(item.changeBalance)}
        </span>
      );
    },
  },
  {
    title: '余额',
    dataIndex: 'creditBalance',
    hideInSearch: true,

    render: (_, item) => <span> ￥{toYuan(item.creditBalance || 0)}</span>,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    hideInSearch: true,
  },
  {
    title: '交易时间',
    valueType: 'dateRange',
    hideInTable: true,
    fieldProps: {
      style: {
        width: '260px',
      },
    },
    search: {
      transform: value => {
        return {
          startTime: value[0] + ' 00:00:00',
          endTime: value[1] + ' 23:59:59',
        };
      },
    },
  },
];

export interface IFundFlowTableProps {
  size?: 'small' | 'middle' | 'large';
}

export const FundFlow = (props: Omit<IFundFlowTableProps, 'query'>) => {
  return (
    <>
      <h3 className={s.title}> 交易明细 </h3>
      <ProTable<any>
        columns={columns}
        className={s.root}
        rowKey="id"
        options={false}
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ y: 300 }}
        defaultSize={props.size || 'small'}
        request={async ({ pageSize = 10, current: pageNo = 1, ...other }) => {
          const { data, totalCount: total } = await request.requestPaginationByGet(
            '/wd/visual/web/balance/balance-details-page-query',
            {
              pageNo,
              pageSize,
              ...other,
            }
          );
          return {
            success: true,
            total,
            data,
          };
        }}
      ></ProTable>
    </>
  );
};
