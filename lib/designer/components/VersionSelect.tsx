import { Select, SelectProps } from 'antd';
import { observer } from 'mobx-react';
import { useDesignerContext } from '../BaseDesignerContext';

export interface VersionSelectProps extends SelectProps {
  ignoreHash?: string;
}

export const VersionSelect = observer(function VersionSelect(props: VersionSelectProps) {
  const { ignoreHash } = props;
  const designModel = useDesignerContext();
  const history = designModel.historyManager;

  return (
    <Select
      placeholder="请选择比对版本"
      options={(ignoreHash ? history.list.filter(i => i.hash !== ignoreHash) : history.list).map(i => {
        return {
          label: i.title,
          value: i.hash,
        };
      })}
      {...props}
    ></Select>
  );
});
