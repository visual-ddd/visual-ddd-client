import { useEditorModel } from '@/lib/editor';
import { Select } from 'antd';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { DomainEditorModel, DomainObject } from '../../../model';
import { NameDSL, ReferenceDSL } from '../../dsl';

/**
 * 命令选择器
 */
export interface CommandOrQuerySelectProps {
  value?: ReferenceDSL;
  onChange?: (value?: ReferenceDSL) => void;
}

export const CommandOrQuerySelect = observer(function CommandOrQuerySelect(props: CommandOrQuerySelectProps) {
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

    const object = model.domainObjectStore.getObjectById(value);

    if (object) {
      onChange?.({ referenceId: object.id, name: `${object.title}(${object.name})` });
    }
  };

  const list: DomainObject<NameDSL>[] = [...model.domainObjectStore.commands, ...model.domainObjectStore.queries];

  return (
    <Select
      className="u-fw"
      placeholder="关联命令或查询"
      showSearch
      allowClear
      optionFilterProp="children"
      value={finalValue}
      onChange={handleChange}
    >
      {list.map(i => {
        return (
          <Select.Option key={i.id} value={i.id}>
            {i.title}({i.name})
          </Select.Option>
        );
      })}
    </Select>
  );
});
