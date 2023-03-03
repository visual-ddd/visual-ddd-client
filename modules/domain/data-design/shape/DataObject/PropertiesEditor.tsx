import { useEditorFormContext, EditorFormItem, EditorFormConsumer, EditorFormItemStatic } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import snakeCase from 'lodash/snakeCase';
import { InputNumber, message, Select, Space, Switch } from 'antd';
import { replaceLastPathToPattern, Clipboard } from '@/lib/utils';

import { NameTooltip, UntitledInCamelCase } from '@/modules/domain/domain-design/dsl/constants';
import { NameInput } from '@/modules/domain/domain-design/dsl/components/NameInput';
import { TitleInput } from '@/modules/domain/domain-design/dsl/components/TitleInput';
import { DescriptionInput } from '@/modules/domain/domain-design/dsl/components/DescriptionInput';
import { MemberList } from '@/modules/domain/domain-design/dsl/components/MemberList';

import {
  createDataObjectPropertyDSL,
  createDataObjectType,
  DataObjectDSL,
  DataObjectPropertyDSL,
  DataObjectTypeList,
  DataObjectTypeName,
  objectTypeThatSupportAutoIncrement,
  objectTypeThatSupportDefaultValue,
  objectTypeThatSupportLength,
  objectTypeThatSupportPrimaryKey,
} from '../../dsl';
import { reactifyProperty } from './reactify';
import { PropertyDefaultValue } from './PropertyDefaultValue';
import { ReferenceEditor } from './ReferenceEditor';
import s from './PropertiesEditor.module.scss';

export interface PropertiesEditorProps {
  /**
   * 属性列表的路径， 默认是 properties
   */
  path?: string;

  /**
   * 操作渲染插槽
   * @param children
   * @returns
   */
  actionSlot?: (children: React.ReactNode) => void;
}

const renderItem = (value: DataObjectPropertyDSL) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { formModel } = useEditorFormContext()!;

  return (
    <div className={classNames('vd-data-properties-editor-item')}>
      {reactifyProperty(formModel.properties as unknown as DataObjectDSL, value)}
    </div>
  );
};

const renderEditor = (path: string) => {
  const p = (cp: string) => `${path}.${cp}`;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { formModel } = useEditorFormContext()!;

  const handleTypeChange = (value: DataObjectTypeName) => {
    if (!value) {
      return;
    }

    const newType = createDataObjectType(value);

    formModel.setProperty(p('type'), newType);
  };

  return (
    <>
      <EditorFormItem
        path={p('name')}
        label="标识符"
        tooltip={NameTooltip['camelCase']}
        // 通知同一层级的命名检查
        notify={replaceLastPathToPattern(path) + '.name'}
      >
        <NameInput nameCase="camelCase" />
      </EditorFormItem>
      <EditorFormItem path={p('title')} label="标题">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path={p('description')} label="描述">
        <DescriptionInput />
      </EditorFormItem>
      <EditorFormConsumer<string> path={p('name')}>
        {({ value }) => {
          return (
            <EditorFormItem
              path={p('propertyName')}
              label="表字段"
              notify={replaceLastPathToPattern(path) + '.propertyName'}
              tooltip={
                <>
                  <div>- {NameTooltip['snake_case']}</div>
                  <div>- 数据库字段名，默认为标识符的 snake_case 模式</div>
                </>
              }
            >
              <NameInput
                nameCase="snake_case"
                placeholder={`表字段名，默认为 ${snakeCase(value || UntitledInCamelCase)}`}
              />
            </EditorFormItem>
          );
        }}
      </EditorFormConsumer>

      <EditorFormConsumer<DataObjectTypeName> path={p('type.type')}>
        {({ value }) => {
          if (!objectTypeThatSupportPrimaryKey(value)) {
            return <></>;
          }

          return (
            <>
              <EditorFormItem
                path={p('primaryKey')}
                label="主键"
                tooltip="标记为主键，如果存在多个主键，属性的顺序就是主键的顺序"
                valuePropName="checked"
              >
                <Switch></Switch>
              </EditorFormItem>
              <EditorFormConsumer<boolean> path={p('primaryKey')}>
                {({ value }) =>
                  value ? (
                    <EditorFormItemStatic label="非空" tooltip="如果是主键，将默认强制开启">
                      <Switch disabled={value} checked></Switch>
                    </EditorFormItemStatic>
                  ) : (
                    <EditorFormItem
                      path={p('notNull')}
                      label="非空"
                      tooltip="如果是主键，将默认强制开启"
                      valuePropName="checked"
                    >
                      <Switch disabled={value}></Switch>
                    </EditorFormItem>
                  )
                }
              </EditorFormConsumer>
            </>
          );
        }}
      </EditorFormConsumer>

      <EditorFormItem path={p('type.type')} label="类型" onChange={handleTypeChange}>
        <Select placeholder="数据类型" className="u-fw">
          {DataObjectTypeList.map(i => {
            return (
              <Select.Option key={i.name} value={i.name}>
                {i.label}({i.name})
              </Select.Option>
            );
          })}
        </Select>
      </EditorFormItem>

      <EditorFormConsumer<DataObjectTypeName> path={p('type.type')}>
        {({ value }) => {
          return (
            <>
              {!!objectTypeThatSupportDefaultValue(value) && (
                <EditorFormItem path={p('type.defaultValue')} label="默认值">
                  <PropertyDefaultValue type={value}></PropertyDefaultValue>
                </EditorFormItem>
              )}
              {!!objectTypeThatSupportAutoIncrement(value) && (
                <EditorFormItem path={p('type.autoIncrement')} label="自增" valuePropName="checked">
                  <Switch></Switch>
                </EditorFormItem>
              )}
              {!!objectTypeThatSupportLength(value) && (
                <EditorFormItem path={p('type.length')} label="长度" tooltip="默认 255">
                  <InputNumber
                    min={1}
                    max={65_535}
                    className="u-fw"
                    placeholder="请输入长度"
                    precision={0}
                  ></InputNumber>
                </EditorFormItem>
              )}
              {value === DataObjectTypeName.Decimal && (
                <>
                  <EditorFormItem path={p('type.precision')} label="精度" tooltip="precision, 默认 10">
                    <InputNumber min={1} max={65} className="u-fw" placeholder="请输入精度" precision={0}></InputNumber>
                  </EditorFormItem>
                  <EditorFormItem path={p('type.scale')} label="小数位" tooltip="scale, 默认 10">
                    <InputNumber
                      min={1}
                      max={65}
                      className="u-fw"
                      placeholder="请输入小数位"
                      precision={0}
                    ></InputNumber>
                  </EditorFormItem>
                </>
              )}
              {value === DataObjectTypeName.Reference && <ReferenceEditor path={p('type')} />}
            </>
          );
        }}
      </EditorFormConsumer>
    </>
  );
};

const CLIPBOARD = new Clipboard<DataObjectPropertyDSL>();

/**
 * 属性编辑器
 */
export const PropertiesEditor = observer(function PropertiesEditor(props: PropertiesEditorProps) {
  const { path = 'properties', actionSlot } = props;
  const { formModel } = useEditorFormContext()!;
  const properties = formModel.getProperty(path);

  const handleChange = (list: DataObjectPropertyDSL[]) => {
    formModel.setProperty(path, list);
  };

  const factory = (): DataObjectPropertyDSL => {
    const item = createDataObjectPropertyDSL();
    item.name += properties.length;

    return item;
  };

  return (
    <MemberList<DataObjectPropertyDSL>
      className="vd-data-properties-editor"
      path={path}
      showError
      value={properties}
      onChange={handleChange}
      factory={factory}
      addText="添加属性"
      editorDisplayType="portal"
      renderItem={renderItem}
      renderEditor={renderEditor}
      editorTitle="属性编辑"
      // eslint-disable-next-line react/no-children-prop
      children={
        !!actionSlot &&
        (context => {
          if (context.readonly) {
            return null;
          }

          actionSlot(
            <Space size="small" className={s.actions}>
              {context.selecting ? (
                <>
                  <span
                    className="u-link"
                    onClick={() => {
                      if (context.selected) {
                        CLIPBOARD.save(context.selected);
                        message.success('已复制');
                      }
                    }}
                  >
                    复制
                  </span>
                  <span className="u-link" onClick={context.handleUnselectAll}>
                    清空
                  </span>
                  <span className="u-link" onClick={context.handleSelectAll}>
                    全选
                  </span>
                  <span className="u-link" onClick={context.handleToggleSelecting}>
                    取消
                  </span>
                </>
              ) : (
                <>
                  {!CLIPBOARD.isEmpty && (
                    <span
                      className="u-link"
                      onClick={() => {
                        context.handleConcat(CLIPBOARD.get());
                      }}
                    >
                      粘贴
                    </span>
                  )}
                  <span
                    className="u-link"
                    onClick={() => {
                      if (context.list.length) {
                        CLIPBOARD.save(context.list);
                        message.success('已复制所有属性');
                      }
                    }}
                  >
                    复制
                  </span>
                  <span className="u-link" onClick={context.handleToggleSelecting}>
                    编辑
                  </span>
                </>
              )}
            </Space>
          );

          return null;
        })
      }
    />
  );
});
