import { Select, SelectProps } from 'antd';
import { AccessList } from '../constants';

export const AccessSelect = (props: SelectProps) => {
  return (
    <Select className="u-fw" {...props}>
      {AccessList.map(i => {
        return (
          <Select.Option key={i.value} value={i.value}>
            {i.label}
          </Select.Option>
        );
      })}
    </Select>
  );
};
