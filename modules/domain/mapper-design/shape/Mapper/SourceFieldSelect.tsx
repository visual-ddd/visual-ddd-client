import { stringifyTypeDSL, UntitledInCamelCase } from '@/modules/domain/domain-design/dsl';
import { Select, SelectProps } from 'antd';
import { observer } from 'mobx-react';
import { useMapper } from './useMapper';

export interface SourceFieldSelectProps extends Omit<SelectProps, 'options'> {}

/**
 * 来源字段筛选
 */
export const SourceFieldSelect = observer(function SourceFieldSelect(props: SourceFieldSelectProps) {
  const mapper = useMapper();

  return (
    <Select
      className="u-fw"
      placeholder="选择字段"
      options={mapper.sourceFields.map(i => {
        return {
          // TODO: 统一格式化
          label: `${i.name || UntitledInCamelCase}: ${stringifyTypeDSL(i.type, id => {
            return mapper.getSourceObjectById(id)?.name || '未知对象';
          })}`,
          value: i.uuid,
        };
      })}
      {...props}
    ></Select>
  );
});
