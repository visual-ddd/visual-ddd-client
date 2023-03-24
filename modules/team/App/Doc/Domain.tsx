import { Doc } from '../../Domain/Doc';
import { DomainDetail } from '../../types';
import { AppDocLayout, AppDocLayoutProps } from './AppDocLayout';

export interface DomainDocProps extends AppDocLayoutProps {
  domain: DomainDetail;
}

export const DomainDoc = (props: DomainDocProps) => {
  return (
    <AppDocLayout info={props.info}>
      <Doc detail={props.domain} />
    </AppDocLayout>
  );
};
