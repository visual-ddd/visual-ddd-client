import { AppDocLayout, AppDocLayoutProps } from './AppDocLayout';
import { Doc, DocProps } from '../../Scenario/Doc';

export interface ScenarioDocProps extends AppDocLayoutProps, DocProps {}

export const ScenarioDoc = (props: ScenarioDocProps) => {
  const { info, detail } = props;
  return (
    <AppDocLayout info={info}>
      <Doc detail={detail} />
    </AppDocLayout>
  );
};
