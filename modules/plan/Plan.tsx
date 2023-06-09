import { request, useRequestByGet } from '@/modules/backend-client';
import { Button, Card, Divider, Modal, Progress, Spin, message } from 'antd';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { PlanIdentity } from '../Lemon/share';
import { PayModal, usePayModalRef } from '../pay';
import s from './Plan.module.scss';
import { IPlanInfo, allowUpgrade, hasExpiredTime, hasFreeLimit, planInfoList } from './planInfo';
import { clearCache, useCurrentPlan } from './useCurrentPlan';
import { formatDate, DATE_TIME_FORMAT } from '@wakeapp/utils';

const PlanStatus = () => {
  const { currentPlan: planInfo, isLoading, data } = useCurrentPlan();

  const { data: remainInfo } = useRequestByGet('/api/rest/ai/free-usage');

  const percent = remainInfo ? (remainInfo.remain / remainInfo.total) * 100 : 0;

  const progressColor = useMemo(() => {
    if (!percent) {
      return '';
    }
    const num = Math.min(5, ~~(percent / 12)) + 2;
    return `var(--vd-color-danger-${num * 100})`;
  }, [percent]);

  const endTime = useMemo(() => {
    if (data) {
      return formatDate(data.renews_at, DATE_TIME_FORMAT);
    }
    return '-';
  }, [data]);

  return (
    <Spin spinning={isLoading}>
      <Card>
        <div className={s.planStatusHeader}>
          <span>当前订阅方案： </span>
          <h4 className={s.planStatusName}>{planInfo.name}</h4>
        </div>
        {hasFreeLimit(planInfo) && (
          <div className={s.planStatusInfo}>
            <span>额度明细：</span>
            <div className={classNames(s.planStatusInfoText, s.flex)}>
              <Progress showInfo={false} percent={percent} className={s.progress} strokeColor={progressColor} />
              {remainInfo && (
                <span className={s.nowrap}>
                  {remainInfo.remain} / {remainInfo.total}
                </span>
              )}
            </div>
          </div>
        )}
        {hasExpiredTime(planInfo) && (
          <div className={s.planStatusInfo}>
            <span>有效期：</span>
            <div className={s.planStatusInfoText}>{endTime}</div>
          </div>
        )}
      </Card>
    </Spin>
  );
};

const PlanCard = (
  props: IPlanInfo & {
    footer?: JSX.Element;
    externalClass?: Record<string, any>;
  }
) => {
  const externalClass = props.externalClass ?? {};
  return (
    <Card className={classNames(s.planCard, externalClass.planCard)}>
      <div className={classNames(s.planName, externalClass.planName)}>{props.name}</div>
      <div className={classNames(s.planPrice, externalClass.planPrice)}> {props.price}</div>
      <dl className={classNames(s.planBody, externalClass.planBody)}>
        <dt className={classNames(s.planDescName, externalClass.planDescName)}>模型列表:</dt>
        <dd className={classNames(s.planDescContent, externalClass.planDescContent)}>{props.models}</dd>
        <dt className={classNames(s.planDescName, externalClass.planDescName)}>功能:</dt>
        <dd className={classNames(s.planDescContent, externalClass.planDescContent)}>{props.modules}</dd>
        <dt className={classNames(s.planDescName, externalClass.planDescName)}>使用限制:</dt>
        <dd className={classNames(s.planDescContent, externalClass.planDescContent)}>{props.requestLimit}</dd>
        <dt className={classNames(s.planDescName, externalClass.planDescName)}>终端数:</dt>
        <dd className={classNames(s.planDescContent, externalClass.planDescContent)}>{props.onLineLimit}</dd>
        <dt className={classNames(s.planDescName, externalClass.planDescName)}>并发限制:</dt>
        <dd className={classNames(s.planDescContent, externalClass.planDescContent)}>{props.concurrency}</dd>
      </dl>
      <div className={classNames(s.planCardFooter, externalClass.planCardFooter)}>{props.footer}</div>
    </Card>
  );
};

interface IUpgradePlanListProps {
  currentPlan: IPlanInfo;
  onSuccess?: (plan: IPlanInfo) => void;
  externalClass?: Record<string, any>;
  renderFooter?: (action: () => void) => JSX.Element;
}

interface ISubscribePlanListProps extends IUpgradePlanListProps {}

export const UpgradePlanList = (props: IUpgradePlanListProps) => {
  const payModalRef = usePayModalRef();

  const list = planInfoList;

  const externalClass = props.externalClass ?? {};

  const upgrade = (plan: IPlanInfo) =>
    request
      .requestByPost('/api/reset/subscription/update', {
        identity: plan.Identifier,
      })
      .then(
        () => {
          // todo 更新逻辑
          message.success('更改套餐成功');
          clearCache();
          props.onSuccess?.(plan);
        },
        err => {
          message.error(err.message);
        }
      );
  const upgradeHandle = async (plan: IPlanInfo) => {
    Modal.confirm({
      title: '更改套餐',
      content: (
        <span>
          是否变更为 <b>{plan.name} </b>
        </span>
      ),
      onOk: async () => upgrade(plan),
      okText: '确认',
      centered: true,
      cancelText: '取消',
    });
  };

  const renderFooter = (plan: IPlanInfo) => {
    const allow = allowUpgrade(props.currentPlan, plan);
    if (allow) {
      return props.renderFooter ? (
        props.renderFooter(() => upgradeHandle(plan))
      ) : (
        <Button type="primary" onClick={() => upgradeHandle(plan)}>
          升级
        </Button>
      );
    }
  };

  return (
    <>
      <PayModal ref={payModalRef}></PayModal>
      <div className={classNames(s.planList, externalClass.planList)}>
        {list.map(item => (
          <PlanCard key={item.name} externalClass={externalClass} {...item} footer={renderFooter(item)} />
        ))}
      </div>
    </>
  );
};

export const SubscribePlanList = (props: ISubscribePlanListProps) => {
  const payModalRef = usePayModalRef();

  const list = planInfoList;

  const externalClass = props.externalClass ?? {};

  const subscribe = (plan: IPlanInfo) =>
    request
      .requestByPost('/api/rest/subscription/create', {
        identity: plan.Identifier,
      })
      .then(
        data => {
          window.open(data.url);

          openPayResultModal(plan);
          return;
        },
        err => {
          message.error(err.message);
        }
      );

  const subscribeHandle = async (plan: IPlanInfo) => {
    Modal.confirm({
      title: '订阅套餐',
      content: (
        <span>
          是否订阅 <b>{plan.name} </b>
        </span>
      ),
      onOk: async () => subscribe(plan),
      okText: '订阅',
      centered: true,
      cancelText: '取消',
    });
  };

  const openPayResultModal = (plan: IPlanInfo) => {
    Modal.confirm({
      title: '支付',
      content: '正在跳转至第三方支付平台',
      okText: '支付成功',
      cancelText: '取消',
      centered: true,
      onOk() {
        checkoutPayStatus(plan);
      },
    });
  };

  const checkoutPayStatus = (plan: IPlanInfo) => {
    clearCache();
    props.onSuccess?.(plan);
  };

  const renderFooter = (plan: IPlanInfo) => {
    const allow = allowUpgrade(props.currentPlan, plan);
    if (allow) {
      return props.renderFooter ? (
        props.renderFooter(() => subscribeHandle(plan))
      ) : (
        <Button type="primary" onClick={() => subscribeHandle(plan)}>
          订阅
        </Button>
      );
    }
  };

  return (
    <>
      <PayModal ref={payModalRef}></PayModal>
      <div className={classNames(s.planList, externalClass.planList)}>
        {list.map(item => (
          <PlanCard key={item.name} externalClass={externalClass} {...item} footer={renderFooter(item)} />
        ))}
      </div>
    </>
  );
};

export const Plan = () => {
  const { currentPlan, isLoading } = useCurrentPlan();
  const [_, setCount] = useState(0);
  const refresh = () => {
    setCount(v => v + 1);
  };
  return (
    <>
      <PlanStatus />
      <Divider />
      <Spin spinning={isLoading}>
        {currentPlan.Identifier === PlanIdentity.None ? (
          <SubscribePlanList currentPlan={currentPlan} onSuccess={() => refresh()} />
        ) : (
          <UpgradePlanList currentPlan={currentPlan} onSuccess={() => refresh()} />
        )}
      </Spin>
    </>
  );
};
