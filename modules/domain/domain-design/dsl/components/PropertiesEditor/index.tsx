import { useEditorFormContext, EditorFormItem } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { message, Space, Switch } from 'antd';
import { replaceLastPathToPattern, Clipboard } from '@/lib/utils';

import { NameDSL, PropertyDSL } from '../../dsl';
import { NameTooltip } from '../../constants';
import { createProperty } from '../../factory';
import { DomainObject, DomainObjectFactory } from '../../../model';
import { useAutoCompleteUbiquitousLanguageFromFormModel } from '../../../hooks';
import { reactifyProperty } from '../../reactify';
import { AccessSelect } from '../AccessSelect';
import { MemberList } from '../MemberList';
import { NameInput } from '../NameInput';
import { DescriptionInput } from '../DescriptionInput';
import { ReferenceTypeProvider, ReferenceTypeProviderProps, TypeInput } from '../TypeInput';
import { TitleInput } from '../TitleInput';

import s from './index.module.scss';

export interface PropertiesEditorProps {
  /**
   * 属性列表的路径， 默认是 properties
   */
  path?: string;

  /**
   * 引用类型过滤器，默认只过滤掉 command
   */
  referenceTypeFilter?: ReferenceTypeProviderProps['filter'];

  /**
   * 操作渲染插槽
   * @param children
   * @returns
   */
  actionSlot?: (children: React.ReactNode) => void;
}

const renderItem = (value: PropertyDSL) => {
  return <div className={classNames('vd-properties-editor-item', s.item)}>{reactifyProperty(value)}</div>;
};

const omitCommand = (i: DomainObject<NameDSL>) => {
  return !DomainObjectFactory.isCommand(i);
};

const renderEditor = (path: string) => {
  const p = (cp: string) => `${path}.${cp}`;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleMatchUbiquitousLanguage = useAutoCompleteUbiquitousLanguageFromFormModel({ path });

  return (
    <>
      <EditorFormItem
        path={p('name')}
        label="标识符"
        tooltip={NameTooltip['camelCase']}
        notify={replaceLastPathToPattern(path) + '.name'}
      >
        <NameInput nameCase="camelCase" onMatchUbiquitousLanguage={handleMatchUbiquitousLanguage} />
      </EditorFormItem>
      <EditorFormItem path={p('title')} label="标题">
        <TitleInput />
      </EditorFormItem>
      <EditorFormItem path={p('description')} label="描述">
        <DescriptionInput />
      </EditorFormItem>
      <EditorFormItem path={p('type')} label="类型">
        <TypeInput />
      </EditorFormItem>
      <EditorFormItem
        path={p('optional')}
        label="可空类型？"
        valuePropName="checked"
        tooltip="表示该字段可能为 null, 比如我们在代码生成时会加上 @Nullable"
      >
        <Switch></Switch>
      </EditorFormItem>
      <EditorFormItem path={p('access')} label="访问控制">
        <AccessSelect />
      </EditorFormItem>
    </>
  );
};

const CLIPBOARD = new Clipboard<PropertyDSL>();

/**
 * 属性编辑器
 */
export const PropertiesEditor = observer(function PropertiesEditor(props: PropertiesEditorProps) {
  const { path = 'properties', referenceTypeFilter = omitCommand, actionSlot } = props;
  const { formModel } = useEditorFormContext()!;
  const properties = formModel.getProperty(path) as PropertyDSL[];

  const handleChange = (list: PropertyDSL[]) => {
    formModel.setProperty(path, list);
  };

  const factory = (): PropertyDSL => {
    const item = createProperty();
    item.name += properties.length;

    return item;
  };

  return (
    <ReferenceTypeProvider filter={referenceTypeFilter}>
      <MemberList<PropertyDSL>
        className="vd-properties-editor"
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
              actionSlot(null);
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
      ></MemberList>
    </ReferenceTypeProvider>
  );
});
