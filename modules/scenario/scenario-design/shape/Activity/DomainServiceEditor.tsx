import { EditorFormConsumer, EditorFormItem, useEditorFormContext, useEditorModel } from '@/lib/editor';
import useSwr from 'swr';
import { Select, SelectProps, Tag } from 'antd';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { ScenarioEditorModel } from '../../model';

import s from './DomainServiceEditor.module.scss';
import cs from './common.module.scss';
import { ShareIcon } from './ShareIcon';

export interface DomainServiceEditorProps {}

const useServiceStore = () => {
  const { model } = useEditorModel<ScenarioEditorModel>();
  return model.domainServiceStore;
};

const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

const COMMON_SELECT_PROPS: SelectProps = {
  showSearch: true,
  optionFilterProp: 'name',
  dropdownMatchSelectWidth: false,
  tagRender: props => {
    const { label, closable, onClose } = props;
    return (
      <Tag className={s.tag} onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose}>
        {label}
      </Tag>
    );
  },
};

const DomainSelect = observer(function DomainSelect(props: SelectProps) {
  const serviceStore = useServiceStore();

  const { data, isLoading } = useSwr(`custom/scenario/domains`, () => {
    return serviceStore.getDomains();
  });

  return (
    <Select
      {...COMMON_SELECT_PROPS}
      {...props}
      loading={isLoading}
      options={data?.map(i => {
        return {
          key: i.id,
          value: i.id,
          name: i.name,
          label: i.name,
        };
      })}
    ></Select>
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

  const options = useMemo(() => {
    return data?.map(i => {
      const open = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        window.open(`/doc/domain/${domainId}/reversion/${i.id}`, `doc-domain-${domainId}-${i.id}`);
      };

      return {
        key: i.id,
        value: i.id,
        name: i.name,
        label: (
          <span>
            {i.label ?? i.name}
            <span className={cs.share} onClick={open}>
              <ShareIcon />
            </span>
          </span>
        ),
      };
    });
  }, [data, domainId]);

  return <Select {...COMMON_SELECT_PROPS} {...other} loading={isLoading} options={options}></Select>;
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
      mode="multiple"
      allowClear
      {...COMMON_SELECT_PROPS}
      {...other}
      loading={isLoading}
    >
      {data?.map(i => {
        const open = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();

          window.open(
            `/doc/domain/${domainId}/reversion/${versionId}#ref-${i.id}`,
            `doc-domain-${domainId}-${versionId}`
          );
        };

        return (
          <Select.Option key={i.id} value={i.id} name={i.name}>
            {i.name}
            <span className={cs.share} onClick={open}>
              <ShareIcon />
            </span>
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
