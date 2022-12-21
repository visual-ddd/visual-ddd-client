import { observer } from 'mobx-react';
import { DomainEditor } from './domain-design';

const Designer = observer(function DomainDesigner() {
  return <DomainEditor />;
});

export default Designer;
