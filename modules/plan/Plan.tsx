import { request, useRequestByGet } from '@/modules/backend-client';
import { Button, Card, Divider, Modal, Progress, Spin, message } from 'antd';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { PayModal, usePayModalRef } from '../pay';
import s from './Plan.module.scss';
import { IPlanInfo, PlanIdentifier, allowUpgrade, hasExpiredTime, hasFreeLimit, planInfoList } from './planInfo';
import { InsufficientBalanceErrorCode } from './shared';
import { clearCache, useCurrentPlan } from './useCurrentPlan';
import { dateAdd, formatDate } from '@wakeapp/utils';

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
            <div className={s.planStatusInfoText}>{data!.subscriptionEnd}</div>
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
      {props.footer}
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

  const list = useMemo(() => {
    return planInfoList.filter(item => item.duration === props.currentPlan.duration);
  }, [props.currentPlan]);

  const externalClass = props.externalClass ?? {};

  const upgrade = (plan: IPlanInfo) =>
    request
      .requestByPost('/wd/visual/web/package-subscription/package-subscription-open', {
        packageIdentity: plan.Identifier,
      })
      .then(
        () => {
          message.success('升级成功');
          clearCache();
          props.onSuccess?.(plan);
        },
        err => {
          if (err.code === InsufficientBalanceErrorCode) {
            openPayModalIfNeed();
          } else {
            message.error(err.message);
          }
        }
      );
  const upgradeHandle = async (plan: IPlanInfo) => {
    Modal.confirm({
      title: '升级套餐',
      content: (
        <span>
          是否升级到 <b>{plan.name} </b>, 费用为 <b>{plan.priceValue}</b> , 有效期至
          <b>{formatDate(dateAdd(plan.duration, 'D'))}</b>
        </span>
      ),
      onOk: async () => upgrade(plan),
      okText: '升级',
      centered: true,
      cancelText: '取消',
    });
  };

  const openPayModalIfNeed = () => {
    Modal.confirm({
      title: '升级失败',
      content: '当前账户余额不足，是否进行充值',
      okText: '进行充值',
      cancelText: '取消',
      centered: true,
      onOk() {
        setTimeout(() => {
          payModalRef.current?.open();
        }, 0);
      },
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

  const list = useMemo(() => {
    return planInfoList.filter(item => item.duration === props.currentPlan.duration);
  }, [props.currentPlan]);

  const externalClass = props.externalClass ?? {};

  const subscribe = (plan: IPlanInfo) =>
    request
      .requestByPost('/wd/visual/web/package-subscription/package-subscription-open', {
        packageIdentity: plan.Identifier,
      })
      .then(
        () => {
          message.success('订阅成功');
          clearCache();
          props.onSuccess?.(plan);
        },
        err => {
          if (err.code === InsufficientBalanceErrorCode) {
            openPayModalIfNeed();
          } else {
            message.error(err.message);
          }
        }
      );

  const subscribeHandle = async (plan: IPlanInfo) => {
    Modal.confirm({
      title: '订阅套餐',
      content: (
        <span>
          是否订阅 <b>{plan.name} </b>, 费用为 <b>{plan.priceValue}</b> , 有效期至
          <b>{formatDate(dateAdd(plan.duration, 'D'))}</b>
        </span>
      ),
      onOk: async () => subscribe(plan),
      okText: '订阅',
      centered: true,
      cancelText: '取消',
    });
  };

  const openPayModalIfNeed = () => {
    Modal.confirm({
      title: '订阅失败',
      content: '当前账户余额不足，是否进行充值',
      okText: '进行充值',
      cancelText: '取消',
      centered: true,
      onOk() {
        setTimeout(() => {
          payModalRef.current?.open();
        }, 0);
      },
    });
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
        {currentPlan.Identifier === PlanIdentifier.None ? (
          <SubscribePlanList currentPlan={currentPlan} onSuccess={() => refresh()} />
        ) : (
          <UpgradePlanList currentPlan={currentPlan} onSuccess={() => refresh()} />
        )}
      </Spin>
    </>
  );
};
