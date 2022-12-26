import { useEditorModel } from '@/lib/editor';
import { Select } from 'antd';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { DomainEditorModel } from '../../../model';
import { ReferenceDSL } from '../../dsl';

/**
 * 聚合选择器
 */
export interface AggregationSelectProps {
  value?: ReferenceDSL;
  onChange?: (value?: ReferenceDSL) => void;
}

export const AggregationSelect = observer(function RulesSelect(props: AggregationSelectProps) {
  const { value, onChange } = props;
  const { model } = useEditorModel<DomainEditorModel>();

  const finalValue = useMemo(() => {
    return value?.referenceId;
  }, [value]);

  const handleChange = (value: string) => {
    if (value == null) {
      onChange?.();
      return;
    }

    const object = model.domainObjectContainer.getObjectById(value);

    if (object) {
      onChange?.({ referenceId: object.id, name: `${object.title}(${object.name})` });
    }
  };

  return (
    <Select
      className="u-fw"
      placeholder="关联聚合"
      showSearch
      allowClear
      optionFilterProp="children"
      value={finalValue}
      onChange={handleChange}
    >
      {model.domainObjectContainer.aggregations.map(i => {
        return (
          <Select.Option key={i.id} value={i.id}>
            {i.title}({i.name})
          </Select.Option>
        );
      })}
    </Select>
  );
});
