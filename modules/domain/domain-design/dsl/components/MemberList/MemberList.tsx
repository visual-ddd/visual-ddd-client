import React, { useMemo } from 'react';
import { Button, Popover } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { EditTwoTone, MinusCircleTwoTone } from '@ant-design/icons';

import { DragHandle, SortableList } from '@/lib/components';

import { IDDSL } from '../../dsl';
import { MemberEditor, useMemberEditorRef } from './MemberEditor';
import { useRefValue } from '@wakeapp/hooks';

import s from './MemberList.module.scss';
import { action, observable } from 'mobx';

export interface MemberListProps<T extends IDDSL> {
  className?: string;
  style?: React.CSSProperties;

  /**
   * 列表字段路径
   */
  path: string;

  /**
   * 列表
   */
  value: T[];

  /**
   * 列表更新
   * @param value
   * @returns
   */
  onChange: (value: T[]) => void;

  /**
   * 创建工厂
   * @returns
   */
  factory: () => T;

  /**
   * 渲染条项内容
   * @param value
   * @param index
   * @returns
   */
  renderItem: (value: T, index: number) => React.ReactElement;

  /**
   * 渲染编辑内容
   * @param basePath
   * @param value
   * @returns
   */
  renderEditor: (basePath: string, value: T) => React.ReactElement;

  /**
   * 编辑内容展示的方式
   * portal 模态框展示
   * popover 浮窗展示
   */
  editorDisplayType: 'portal' | 'popover';

  editorTitle?: React.ReactNode;

  /**
   * 添加按钮文本，默认为 添加属性
   */
  addText?: React.ReactNode;
}

interface MemberListContext<T extends IDDSL> {
  /**
   * 当前正在编辑的条项 id
   */
  editing?: string;

  /**
   * 编辑
   * @param item
   * @returns
   */
  handleEdit: (item: T) => void;

  /**
   * 关闭编辑
   * @returns
   */
  handleEditHided: () => void;

  /**
   * 移除
   * @param item
   * @returns
   */
  handleRemove: (item: T) => void;

  /**
   * 列表更新
   * @param list
   * @returns
   */
  handleChange: (list: T[]) => void;

  /**
   * 新增
   * @returns
   */
  handleCreate: () => void;

  /**
   * 渲染条项
   * @param item
   * @param index
   * @returns
   */
  handleRenderItem: (item: T, index: number) => React.ReactElement;

  handleRenderEditor: (basePath: string, value: T) => React.ReactElement;

  getPath: () => string;

  getEditorDisplayType: () => 'portal' | 'popover';

  getEditorTitle: () => React.ReactNode;
}

const Member = observer(function Member<T extends IDDSL>(props: {
  value: T;
  context: MemberListContext<T>;
  index: number;
}) {
  const { value, context, index } = props;
  const popoverEdit = context.getEditorDisplayType() === 'popover';
  const path = context.getPath();
  const editing = value.uuid === context.editing;

  return (
    <div className={classNames('vd-member-list-item', s.item, { editing })}>
      <DragHandle className={classNames('vd-member-list-item__handle', s.itemHandle)} />
      <div className={classNames('vd-member-list-item__content', s.itemContent)}>
        {context.handleRenderItem(value, index)}
      </div>
      <div className={classNames('vd-member-list-item__actions', s.itemActions)}>
        {popoverEdit ? (
          <Popover
            trigger="click"
            title={context.getEditorTitle()}
            destroyTooltipOnHide
            onOpenChange={v => {
              if (v) {
                context.handleEditHided();
              } else {
                context.handleEdit(value);
              }
            }}
            content={context.handleRenderEditor(`${path}[${index}]`, value)}
            placement="left"
          >
            <EditTwoTone
              onClick={() => {
                context.handleEdit(value);
              }}
            />
          </Popover>
        ) : (
          <EditTwoTone
            onClick={() => {
              context.handleEdit(value);
            }}
          />
        )}

        <MinusCircleTwoTone
          onClick={() => {
            context.handleRemove(value);
          }}
        />
      </div>
    </div>
  );
});

/**
 * 属性编辑器
 * TODO: 数据结果回显
 * TODO: 触发验证
 */
export const MemberList = observer(function MemberList<T extends IDDSL>(props: MemberListProps<T>) {
  const { className, style, value, addText, path, renderEditor, editorTitle, editorDisplayType } = props;
  const propsRef = useRefValue(props);
  const editorRef = useMemberEditorRef<T>();

  const context = useMemo<MemberListContext<T>>(() => {
    const store = observable({ editing: undefined as string | undefined });
    const updateEditing = action('UPDATE_EDITING', (v?: string) => {
      store.editing = v;
    });

    const self: MemberListContext<T> = {
      get editing() {
        return store.editing;
      },
      getEditorDisplayType() {
        return propsRef.current.editorDisplayType;
      },
      getEditorTitle() {
        return propsRef.current.editorTitle;
      },
      getPath() {
        return propsRef.current.path;
      },
      handleEdit(item) {
        editorRef.current?.show(item);
        requestAnimationFrame(() => {
          updateEditing(item.uuid);
        });
      },
      handleEditHided() {
        updateEditing();
      },
      handleRemove(item) {
        const list = propsRef.current.value;
        const idx = list.findIndex(i => i.uuid === item.uuid);
        if (idx !== -1) {
          const clone = list.slice();
          clone.splice(idx, 1);

          propsRef.current.onChange(clone);
        }
      },
      handleCreate() {
        const newItem = propsRef.current.factory();
        const clone = propsRef.current.value.slice();

        clone.push(newItem);

        propsRef.current.onChange(clone);

        requestAnimationFrame(() => {
          if (editorRef.current) {
            self.handleEdit(newItem);
          }
        });
      },
      handleChange(list: T[]) {
        propsRef.current.onChange(list);
      },
      handleRenderItem(item, index) {
        return propsRef.current.renderItem(item, index);
      },
      handleRenderEditor(basePath, value) {
        return propsRef.current.renderEditor(basePath, value);
      },
    };

    return self;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classNames('vd-member-list', s.root, className)} style={style}>
      <SortableList<T, MemberListContext<T>>
        value={value}
        onChange={context.handleChange}
        id="uuid"
        Item={Member}
        context={context}
      ></SortableList>
      <Button className={classNames('vd-member-list__add', s.add)} onClick={context.handleCreate}>
        {addText ?? '添加属性'}
      </Button>
      {editorDisplayType === 'portal' && (
        <MemberEditor list={value} path={path} ref={editorRef} title={editorTitle} onHide={context.handleEditHided}>
          {renderEditor}
        </MemberEditor>
      )}
    </div>
  );
});
