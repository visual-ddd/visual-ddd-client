import { AppDocLayout, AppDocLayoutProps } from './AppDocLayout';

export interface ScenarioDocProps extends AppDocLayoutProps {}

export const ScenarioDoc = (props: ScenarioDocProps) => {
  return <AppDocLayout info={props.info}>敬请期待</AppDocLayout>;
};
