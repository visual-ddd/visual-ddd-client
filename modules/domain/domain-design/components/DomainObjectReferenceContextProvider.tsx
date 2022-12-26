import { useEditorModel } from '@/lib/editor';
import { observer, useLocalObservable } from 'mobx-react';
import { ReferencesContextProvider, ReferencesContextValue } from '../dsl/context';
import { DomainEditorModel } from '../model';

export const DomainObjectReferenceContextProvider = observer(function DomainObjectReferenceContextProvider(props: {
  children: React.ReactNode;
}) {
  const { model } = useEditorModel<DomainEditorModel>();
  const store = useLocalObservable(() => {
    return {
      get references() {
        return model.domainObjectStore.referableObjects.map(i => {
          return {
            get label() {
              return i.name;
            },
            value: i.id,
          };
        });
      },
      get contextValue(): ReferencesContextValue {
        return { references: this.references };
      },
    };
  });

  return <ReferencesContextProvider value={store}>{props.children}</ReferencesContextProvider>;
});
