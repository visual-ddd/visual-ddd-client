import { DesignerHeader } from '@/lib/components/DesignerLayout';
import { VersionStatus } from '@/lib/core';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { useDomainDesignerContext } from '../Context';
import { DomainDesignerTabsMap } from '../model';

export interface DomainDesignerHeaderProps {
  name?: React.ReactNode;
  version?: string;
  versionStatus?: VersionStatus;
}

export const DomainDesignerHeader = observer(function DomainDesignerHeader(props: DomainDesignerHeaderProps) {
  const { name, version, versionStatus } = props;
  const model = useDomainDesignerContext()!;
  const saveTitle = useMemo(() => {
    const desc = model.keyboardBinding.getReadableKeyBinding('save');
    return `${desc.description}(${desc.key})`;
  }, [model]);

  return (
    <DesignerHeader
      name={name}
      version={version}
      versionStatus={versionStatus}
      title={DomainDesignerTabsMap[model.activeTab]}
      readonly={model.readonly}
      saveTooltip={saveTitle}
      saving={model.saving}
      onSave={() => model.keyboardBinding.trigger('save')}
    ></DesignerHeader>
  );
});
