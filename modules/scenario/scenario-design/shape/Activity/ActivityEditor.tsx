import { EditorFormConsumer, EditorFormContainer, EditorFormItem } from '@/lib/editor';
import { TitleInput } from '@/lib/components/TitleInput';
import { DescriptionInput } from '@/lib/components/DescriptionInput';
import { Select } from 'antd';

import { ActivityBindingType } from '../../dsl';

import { ScenarioServiceSelect } from './ScenarioServiceSelect';
import { DomainServiceEditor } from './DomainServiceEditor';
import { ExternalServiceEditor } from './ExternalServiceEditor';

export const ActivityEditor = () => {
  return (
    <EditorFormContainer>
      <EditorFormItem path="title" label="名称">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path="description" label="描述">
        <DescriptionInput />
      </EditorFormItem>
      <EditorFormItem path="binding.type" label="关联服务">
        <Select placeholder="选择关联服务类型" className="u-fw" allowClear>
          <Select.Option value={ActivityBindingType.ScenarioService}>业务场景服务</Select.Option>
          <Select.Option value={ActivityBindingType.DomainService}>业务域服务</Select.Option>
          <Select.Option value={ActivityBindingType.ExternalService}>外部服务</Select.Option>
        </Select>
      </EditorFormItem>
      <EditorFormConsumer<ActivityBindingType | undefined> path="binding.type">
        {({ value }) => {
          if (!value) {
            return <></>;
          }

          if (value === ActivityBindingType.ScenarioService) {
            return (
              <EditorFormItem path="binding.serviceId" label="服务">
                <ScenarioServiceSelect placeholder="选择业务场景服务" className="u-fw" />
              </EditorFormItem>
            );
          } else if (value === ActivityBindingType.ExternalService) {
            return <ExternalServiceEditor />;
          } else {
            return <DomainServiceEditor />;
          }
        }}
      </EditorFormConsumer>
    </EditorFormContainer>
  );
};
