import { EditorFormConsumer, EditorFormItem, useEditorFormContext } from '@/lib/editor';
import { MemberList } from '@/modules/domain/domain-design/dsl/components/MemberList';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { FieldMapperDSL, createFieldMapperDSL } from '../../dsl';
import { reactifyMapper } from './reactify';
import { SourceFieldSelect } from './SourceFieldSelect';
import { TargetFieldSelect } from './TargetFieldSelect';
import { useMapper } from './useMapper';

export interface MappersListProps {
  /**
   * 映射列表路径，默认是 mappers
   */
  path?: string;
}

const renderItem = (value: FieldMapperDSL) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mapper = useMapper();

  return <div className={classNames('vd-mappers__item')}>{reactifyMapper(value.source, value.target, mapper)}</div>;
};

const renderEditor = (path: string) => {
  const p = (cp: string) => `${path}.${cp}`;

  return (
    <>
      <EditorFormItem path={p('source')} label="来源字段" required>
        <SourceFieldSelect></SourceFieldSelect>
      </EditorFormItem>
      <EditorFormConsumer<string | undefined> path={p('source')}>
        {({ value }) => {
          return (
            <EditorFormItem
              path={p('target')}
              label="目标字段"
              required
              dependencies={p('source')}
              dependenciesTriggerWhenTouched={false}
            >
              <TargetFieldSelect sourceField={value} />
            </EditorFormItem>
          );
        }}
      </EditorFormConsumer>
    </>
  );
};

export const MappersList = observer(function Mappers(props: MappersListProps) {
  const { path = 'mappers' } = props;
  const { formModel } = useEditorFormContext()!;
  const list = formModel.getProperty(path);
  const mapper = useMapper();

  const handleChange = (list: FieldMapperDSL[]) => {
    formModel.setProperty(path, list);
  };

  const factory = (): FieldMapperDSL => {
    return createFieldMapperDSL();
  };

  if (mapper.sourceObject == null || mapper.targetObject == null) {
    return <div className="u-tc u-gray-500 u-fs-5">请选择来源对象和目标对象</div>;
  }

  return (
    <MemberList
      className="vd-mappers"
      path={path}
      showError
      value={list}
      onChange={handleChange}
      factory={factory}
      addText="添加映射"
      editorDisplayType="portal"
      editorTitle="映射编辑"
      renderItem={renderItem}
      renderEditor={renderEditor}
    ></MemberList>
  );
});
