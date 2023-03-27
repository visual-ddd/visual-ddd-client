import { useEditorModel } from '@/lib/editor';
import { UntitledInCamelCase, UntitledInHumanReadable } from '@/modules/domain/domain-design/dsl/constants';
import { Select, SelectProps } from 'antd';
import { observer } from 'mobx-react';

import { ScenarioEditorModel } from '../../model';

import cs from './common.module.scss';

import { ShareIcon } from './ShareIcon';

export interface ScenarioServiceSelectProps extends SelectProps {}

export const ScenarioServiceSelect = observer(function ScenarioServiceSelect(props: ScenarioServiceSelectProps) {
  const { model } = useEditorModel<ScenarioEditorModel>();
  return (
    <Select showSearch optionFilterProp="name" allowClear {...props}>
      {model.serviceStore.list.map(i => {
        const name = `${i.title || UntitledInHumanReadable}(${i.name || UntitledInCamelCase})`;
        const open = (evt: React.MouseEvent) => {
          evt.preventDefault();
          evt.stopPropagation();

          model.serviceStore.openObjectById(i.uuid);
        };

        return (
          <Select.Option value={i.uuid} key={i.uuid} name={name}>
            <span>{name}</span>
            <span className={cs.share} onClick={open}>
              <ShareIcon />
            </span>
          </Select.Option>
        );
      })}
    </Select>
  );
});
