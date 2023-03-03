import { useEditorFormContext, EditorFormItem } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Button, Space } from 'antd';

import { NameDSL, PropertyDSL } from '../../dsl';
import { NameTooltip } from '../../constants';
import { createProperty } from '../../factory';
import { AccessSelect } from '../AccessSelect';
import { MemberList } from '../MemberList';
import { NameInput } from '../NameInput';

import s from './index.module.scss';
import { DescriptionInput } from '../DescriptionInput';
import { reactifyProperty } from '../../reactify';
import { ReferenceTypeProvider, ReferenceTypeProviderProps, TypeInput } from '../TypeInput';
import { TitleInput } from '../TitleInput';
import { DomainObject, DomainObjectFactory } from '../../../model';
import { replaceLastPathToPattern } from '@/lib/utils';
import { Clipboard } from './Clipboard';

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
  return (
    <>
      <EditorFormItem
        path={p('name')}
        label="标识符"
        tooltip={NameTooltip['camelCase']}
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
      <EditorFormItem path={p('type')} label="类型">
        <TypeInput />
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
              return null;
            }

            actionSlot(
              <Space size="small" className={s.actions}>
                {context.selecting ? (
                  <>
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
                    <span className="u-link" onClick={context.handleToggleSelecting}>
                      编辑
                    </span>
                  </>
                )}
              </Space>
            );

            if (context.selecting) {
              return (
                <Button
                  disabled={!context.selected.length}
                  block
                  onClick={() => {
                    CLIPBOARD.save(context.selected);
                  }}
                >
                  复制
                </Button>
              );
            }

            return null;
          })
        }
      ></MemberList>
    </ReferenceTypeProvider>
  );
});
