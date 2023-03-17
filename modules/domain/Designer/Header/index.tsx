import { DesignerHeader } from '@/lib/components/DesignerLayout';
import { IUser, VersionStatus } from '@/lib/core';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { useDomainDesignerContext } from '../Context';
import { DomainDesignerTabsMap } from '../model';

export interface DomainDesignerHeaderProps {
  name?: React.ReactNode;
  version?: string;
  versionStatus?: VersionStatus;
  user?: IUser;
}

export const DomainDesignerHeader = observer(function DomainDesignerHeader(props: DomainDesignerHeaderProps) {
  const { name, version, versionStatus, user } = props;
  const model = useDomainDesignerContext()!;
  const saveTitle = useMemo(() => {
    const desc = model.keyboardBinding.getReadableKeyBinding('save');
    return `${desc.description}(${desc.key})`;
  }, [model]);

  const awarenessUsers = useMemo(() => {
    return model.awarenessUsers.map(i => {
      if (i.id === user?.id) {
        return { ...i, name: `${i.name}(你)` };
      }
      return i;
    });
  }, [model.awarenessUsers, user]);

  return (
    <DesignerHeader
      name={name}
      version={version}
      versionStatus={versionStatus}
      title={DomainDesignerTabsMap[model.activeTab]}
      readonly={model.readonly}
      saveTooltip={saveTitle}
      saving={model.saving || model.refreshing}
      onSave={() => model.keyboardBinding.trigger('save')}
      collaborators={awarenessUsers}
    ></DesignerHeader>
  );
});
