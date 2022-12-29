import { useEditorFormContext, useEditorModel } from '@/lib/editor';
import { observer } from 'mobx-react';
import { DomainEditorModel } from '../../../model';
import { NameInputProps, NameInput } from '../NameInput';

export interface ObjectNameInputProps extends NameInputProps {}

export const ObjectNameInput = observer(function ObjectNameInput(props: ObjectNameInputProps) {
  const { model } = useEditorModel<DomainEditorModel>();
  const { formModel } = useEditorFormContext()!;

  const handleBlur = () => {
    const node = formModel.node;
    model.domainObjectStore.emitNameChanged({ node, object: model.domainObjectStore.getObjectById(node.id)! });
  };

  return <NameInput nameCase="CamelCase" dbclickToEnable onBlur={handleBlur} {...props} />;
});
