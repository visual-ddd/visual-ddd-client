import { Select, SelectProps } from 'antd';
import { observer } from 'mobx-react';
import { useMapper } from './useMapper';

export interface TargetFieldSelectProps extends Omit<SelectProps, 'options'> {
  /**
   * 来源字段 id
   */
  sourceField?: string;
}

/**
 * 目标字段筛选
 */
export const TargetFieldSelect = observer(function TargetFieldSelect(props: TargetFieldSelectProps) {
  const { sourceField, ...other } = props;
  const mapper = useMapper();
  const source = mapper.getSourceFieldById(sourceField);
  const options = mapper.getCompatibleTargetField(sourceField).map(i => {
    return {
      label: `${i.name}: ${i.type.type}`,
      value: i.uuid,
    };
  });
  const disabled = source == null || options.length === 0;

  return <Select className="u-fw" disabled={disabled} options={options} placeholder="选择字段" {...other}></Select>;
});
