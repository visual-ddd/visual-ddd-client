import { observer } from 'mobx-react';
import { NameInputProps, NameInput } from '../NameInput';

export interface ObjectNameInputProps extends NameInputProps {}

export const ObjectNameInput = observer(function ObjectNameInput(props: ObjectNameInputProps) {
  return <NameInput nameCase="CamelCase" dbclickToEnable {...props} />;
});
