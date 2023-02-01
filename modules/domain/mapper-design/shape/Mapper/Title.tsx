import { NameDSL, UntitledInHumanReadable, UntitledInUpperCamelCase } from '@/modules/domain/domain-design/dsl';
import { observer } from 'mobx-react';

export interface TitleProps {
  value: NameDSL;
}

export const Title = observer(function Title(props: TitleProps) {
  const { value } = props;
  return <span>{`${value.title || UntitledInHumanReadable}(${value.name || UntitledInUpperCamelCase})`}</span>;
});
