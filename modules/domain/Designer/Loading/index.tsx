import { DesignerLoading } from '@/lib/designer';
import { observer } from 'mobx-react';

import { useDomainDesignerContext } from '../Context';

export const DomainDesignerLoading = observer(function DomainDesignerLoading() {
  const model = useDomainDesignerContext();

  return <DesignerLoading loading={model?.loading} />;
});
