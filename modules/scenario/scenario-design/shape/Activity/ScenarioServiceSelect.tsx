import { useEditorModel } from '@/lib/editor';
import { UntitledInCamelCase, UntitledInHumanReadable } from '@/modules/domain/domain-design/dsl/constants';
import { Select, SelectProps } from 'antd';
import { observer } from 'mobx-react';

import { ScenarioEditorModel } from '../../model';

export interface ScenarioServiceSelectProps extends SelectProps {}

export const ScenarioServiceSelect = observer(function ScenarioServiceSelect(props: ScenarioServiceSelectProps) {
  const { model } = useEditorModel<ScenarioEditorModel>();
  return (
    <Select showSearch optionFilterProp="children" allowClear {...props}>
      {model.serviceStore.list.map(i => {
        return (
          <Select.Option value={i.uuid} key={i.uuid}>
            {i.title || UntitledInHumanReadable}({i.name || UntitledInCamelCase})
          </Select.Option>
        );
      })}
    </Select>
  );
});
