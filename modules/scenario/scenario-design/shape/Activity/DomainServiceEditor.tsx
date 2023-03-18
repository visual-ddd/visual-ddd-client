import { EditorFormConsumer, EditorFormItem, useEditorFormContext, useEditorModel } from '@/lib/editor';
import useSwr from 'swr';
import { Select, SelectProps } from 'antd';
import { observer } from 'mobx-react';

import { ScenarioEditorModel } from '../../model';

export interface DomainServiceEditorProps {}

const useServiceStore = () => {
  const { model } = useEditorModel<ScenarioEditorModel>();
  return model.domainServiceStore;
};

const COMMON_SELECT_PROPS: SelectProps = {
  showSearch: true,
  optionFilterProp: 'children',
};

const DomainSelect = observer(function DomainSelect(props: SelectProps) {
  const serviceStore = useServiceStore();

  const { data, isLoading } = useSwr(`custom/scenario/domains`, () => {
    return serviceStore.getDomains();
  });

  return (
    <Select {...COMMON_SELECT_PROPS} {...props} loading={isLoading}>
      {data?.map(i => {
        return (
          <Select.Option key={i.id} value={i.id}>
            {i.name}
          </Select.Option>
        );
      })}
    </Select>
  );
});

const VersionSelect = observer(function VersionSelect(
  props: SelectProps & {
    domainId?: string;
  }
) {
  const { domainId, ...other } = props;
  const serviceStore = useServiceStore();

  const { data, isLoading } = useSwr(domainId ? `custom/scenario/domain/version/${domainId}` : null, () => {
    return serviceStore.getDomainVersionList(domainId!);
  });

  return (
    <Select {...COMMON_SELECT_PROPS} {...other} loading={isLoading}>
      {data?.map(i => {
        return (
          <Select.Option key={i.id} value={i.id}>
            {i.name}
          </Select.Option>
        );
      })}
    </Select>
  );
});

const ServiceSelect = observer(function ServiceSelect(
  props: SelectProps & {
    domainId?: string;
    versionId?: string;
  }
) {
  const { domainId, versionId, ...other } = props;
  const serviceStore = useServiceStore();

  const { data, isLoading } = useSwr(
    domainId && versionId ? `custom/scenario/domain/${domainId}/version/${versionId}` : null,
    () => {
      return serviceStore.getDomainServiceList(domainId!, versionId!);
    }
  );

  return (
    <Select
      dropdownMatchSelectWidth={false}
      mode="tags"
      allowClear
      {...COMMON_SELECT_PROPS}
      {...other}
      loading={isLoading}
    >
      {data?.map(i => {
        return (
          <Select.Option key={i.id} value={i.id}>
            {i.name}
          </Select.Option>
        );
      })}
    </Select>
  );
});

export const DomainServiceEditor = observer(function DomainServiceEditor(props: DomainServiceEditorProps) {
  const { formModel } = useEditorFormContext()!;

  // 重置
  const handleDomainIdChange = (v: any) => {
    formModel.setProperty('binding.versionId', undefined);
    formModel.setProperty('binding.domainServiceId', undefined);

    return v;
  };

  const handleVersionIdChange = (v: any) => {
    formModel.setProperty('binding.domainServiceId', undefined);

    return v;
  };

  return (
    <>
      <EditorFormItem path="binding.domainId" label="业务域" onBeforeChange={handleDomainIdChange}>
        <DomainSelect className="u-fw" placeholder="选择业务域" />
      </EditorFormItem>
      <EditorFormConsumer<string | undefined> path="binding.domainId">
        {({ value: domainId }) => {
          return (
            <>
              <EditorFormItem path="binding.versionId" label="版本" onBeforeChange={handleVersionIdChange}>
                <VersionSelect className="u-fw" placeholder="选择业务域版本" domainId={domainId} />
              </EditorFormItem>
              <EditorFormConsumer<string | undefined> path="binding.versionId">
                {({ value: versionId }) => {
                  return (
                    <EditorFormItem path="binding.domainServiceId" label="服务">
                      <ServiceSelect
                        className="u-fw"
                        placeholder="选择服务"
                        domainId={domainId}
                        versionId={versionId}
                      />
                    </EditorFormItem>
                  );
                }}
              </EditorFormConsumer>
            </>
          );
        }}
      </EditorFormConsumer>
    </>
  );
});
