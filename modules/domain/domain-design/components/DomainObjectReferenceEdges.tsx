import { useEditorModel } from '@/lib/editor';
import { EdgeBinding } from '@/lib/g6-binding';
import { observer } from 'mobx-react';
import { DomainEditorModel } from '../model';

export const DomainObjectReferenceEdges = observer(function DomainObjectReferenceEdges() {
  const { model } = useEditorModel<DomainEditorModel>();

  if (!model.domainObjectContainer.edges.length) {
    return null;
  }

  return (
    <>
      {model.domainObjectContainer.edges.map(i => {
        return <EdgeBinding key={i.id} source={i.source} target={i.target}></EdgeBinding>;
      })}
    </>
  );
});
