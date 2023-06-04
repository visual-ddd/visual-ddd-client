import { Button } from 'antd';
import s from './Page.module.scss';
import { UpgradePlanList } from './Plan';
import { createPlan } from './planInfo';
import { Header } from '../home';
import { PlanIdentity } from '../Lemon/share';

export const PlanPage = () => {
  return (
    <div className={s.root}>
      <Header></Header>
      <h3 className={s.title}> 套餐详情 </h3>
      <UpgradePlanList
        externalClass={s}
        currentPlan={createPlan(PlanIdentity.None)}
        renderFooter={action => (
          <Button block onClick={action} type="primary" className={s.button}>
            订阅
          </Button>
        )}
      />
    </div>
  );
};
