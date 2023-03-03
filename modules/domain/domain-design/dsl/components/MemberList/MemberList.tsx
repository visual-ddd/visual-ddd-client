import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Popover, Space } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { EditTwoTone, MinusCircleTwoTone } from '@ant-design/icons';
import { action, observable } from 'mobx';
import { useRefValue } from '@wakeapp/hooks';
import { NoopArray } from '@wakeapp/utils';
import { v4 } from 'uuid';

import { EditorFormTooltip, useEditorFormContext } from '@/lib/editor';
import { DragHandle, SortableList } from '@/lib/components/SortableList';

import { IDDSL } from '../../dsl';

import { MemberEditor, useMemberEditorRef } from './MemberEditor';

import s from './MemberList.module.scss';

export interface MemberListProps<T extends IDDSL> {
  className?: string;

  style?: React.CSSProperties;

  children?: React.ReactNode | ((context: MemberListContext<T>) => React.ReactNode);

  /**
   * 列表字段路径
   */
  path: string;

  /**
   * 是否聚合字段异常, 默认 false
   */
  showError?: boolean;

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

  /**
   * 编辑器模式
   */
  editorTitle?: React.ReactNode;

  /**
   * 添加按钮文本，默认为 添加属性
   */
  addText?: React.ReactNode;

  /**
   * 禁用状态
   */
  disabled?: boolean;

  /**
   * 引用上下文
   */
  contextRef?: React.RefObject<MemberListContext<T>>;
}

export interface MemberListContext<T extends IDDSL> {
  /**
   * 只读模式
   */
  readonly readonly: boolean;

  /**
   * 当前正在编辑的条项 id
   */
  readonly editing?: string;

  /**
   * 当前正在选择模式
   */
  readonly selecting: boolean;

  /**
   * 已选中
   */
  readonly selected: T[];

  readonly list: T[];

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
   * 删除已选中节点
   * @returns
   */
  handleRemoveSelected: () => void;

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
   * 合并
   * @param items
   * @returns
   */
  handleConcat: (items: T[]) => void;

  /**
   * 渲染条项
   * @param item
   * @param index
   * @returns
   */
  handleRenderItem: (item: T, index: number) => React.ReactElement;

  /**
   * 编辑器渲染
   * @param basePath
   * @param value
   * @returns
   */
  handleRenderEditor: (basePath: string, value: T) => React.ReactElement;

  /**
   * 列表验证
   * @returns
   */
  handleValidate: () => void;

  handleSelectAll: () => void;

  handleUnselectAll: () => void;

  handleToggleSelecting: () => void;

  handleToggleSelected: (item: T) => void;

  getPath: () => string;

  getEditorDisplayType: () => 'portal' | 'popover';

  getEditorTitle: () => React.ReactNode;

  getShowError: () => boolean;

  /**
   * 当前元素是否选中
   * @param item
   * @returns
   */
  isSelected: (item: T) => boolean;
}

const Member = observer(function Member<T extends IDDSL>(props: {
  value: T;
  context: MemberListContext<T>;
  index: number;
}) {
  const { value, context, index } = props;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const readonly = context.readonly;
  const popoverEdit = context.getEditorDisplayType() === 'popover';
  const path = context.getPath();
  const editing = value.uuid === context.editing;
  const showError = context.getShowError();
  const pathWithIndex = `${path}[${index}]`;
  const selecting = context.selecting;
  const selected = context.isSelected(value);

  const handleEdit = () => {
    if (selecting) {
      return;
    }

    context.handleEdit(value);
    if (popoverEdit) {
      setPopoverOpen(true);
    }
  };

  const handleRemove = () => {
    context.handleRemove(value);
  };

  const handleSelectedChange = (evt: React.MouseEvent) => {
    if (!selecting) {
      return;
    }

    evt.stopPropagation();
    evt.preventDefault();

    context.handleToggleSelected(value);
  };

  return (
    <div
      className={classNames('vd-member-list-item', s.item, { editing: editing && !selecting, selected })}
      title={selecting ? '点击选择' : '双击编辑'}
      onDoubleClick={handleEdit}
      onClickCapture={handleSelectedChange}
    >
      {selecting ? (
        <Checkbox
          checked={selected}
          // onChange={handleSelectedChange}
          className={classNames('vd-member-list-item__check', s.itemCheck)}
        ></Checkbox>
      ) : (
        <DragHandle className={classNames('vd-member-list-item__handle', s.itemHandle)} />
      )}
      <div className={classNames('vd-member-list-item__content', s.itemContent)}>
        {context.handleRenderItem(value, index)}
      </div>
      {!selecting && (
        <div className={classNames('vd-member-list-item__actions', s.itemActions)}>
          {popoverEdit ? (
            <Popover
              trigger="click"
              title={context.getEditorTitle()}
              destroyTooltipOnHide
              open={popoverOpen}
              onOpenChange={v => {
                setPopoverOpen(v);
                if (!v) {
                  context.handleEditHided();
                } else {
                  handleEdit();
                }
              }}
              content={context.handleRenderEditor(pathWithIndex, value)}
              placement="left"
            >
              <EditTwoTone onClick={handleEdit} />
            </Popover>
          ) : (
            <EditTwoTone onClick={handleEdit} />
          )}
          {!readonly && <MinusCircleTwoTone onClick={handleRemove} />}
          {showError && <EditorFormTooltip path={pathWithIndex} aggregated></EditorFormTooltip>}
        </div>
      )}
    </div>
  );
});

/**
 * 引用 MemberList 上下文
 * @returns
 */
export function useMemberListContextRef<T extends IDDSL>() {
  return useRef<MemberListContext<T>>(null);
}

/**
 * 属性编辑器
 * TODO: 数据结果回显
 * TODO: 触发验证
 */
export const MemberList = observer(function MemberList<T extends IDDSL>(props: MemberListProps<T>) {
  const {
    className,
    style,
    value,
    addText,
    path,
    renderEditor,
    disabled,
    showError = false,
    editorTitle,
    editorDisplayType,
    children,
  } = props;
  const { formModel, readonly } = useEditorFormContext()!;
  const propsRef = useRefValue(props);
  const editorRef = useMemberEditorRef<T>();

  const { context, setReadonly } = useMemo(() => {
    const store = observable({
      readonly: readonly,
      editing: undefined as string | undefined,
      // 选择模式
      selecting: false,
      // 已选中元素
      selected: [] as T[],
    });

    const updateEditing = action('UPDATE_EDITING', (v?: string) => {
      store.editing = v;
    });

    const toggleSelecting = action('TOGGLE_SELECTING', () => {
      if (!(store.selecting = !store.selecting)) {
        store.selected = [];
      }
    });

    const toggleSelected = action('TOGGLE_SELECTED', (item: T) => {
      const idx = store.selected.findIndex(i => i.uuid === item.uuid);
      if (idx === -1) {
        store.selected.push(item);
      } else {
        store.selected.splice(idx, 1);
      }
    });

    const selectAll = action('SELECT_ALL', () => {
      store.selected = [...(propsRef.current.value ?? NoopArray)];
    });

    const unselectAll = action('UNSELECT_ALL', () => {
      store.selected = [];
    });

    const setReadonly = action('SET_READONLY', (v: boolean) => {
      store.readonly = v;
    });

    const self = {
      get editing() {
        return store.editing;
      },
      get selecting() {
        return store.selecting;
      },
      get selected() {
        return store.selected;
      },
      get readonly() {
        return store.readonly;
      },
      get list() {
        return propsRef.current.value ?? NoopArray;
      },
      isSelected(item: T) {
        return store.selected.findIndex(i => i.uuid === item.uuid) !== -1;
      },
      getShowError() {
        return showError;
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
      handleToggleSelected: toggleSelected,
      handleToggleSelecting: toggleSelecting,
      handleSelectAll: selectAll,
      handleUnselectAll: unselectAll,
      handleEdit(item) {
        editorRef.current?.show(item);
        requestAnimationFrame(() => {
          updateEditing(item.uuid);
        });
      },
      handleEditHided() {
        updateEditing();
      },
      handleRemoveSelected() {
        const selected = store.selected;
        if (!selected.length) {
          return;
        }
        const list = propsRef.current.value;
        const clone = list.slice();

        selected.forEach(i => {
          const idx = clone.findIndex(j => j.uuid === i.uuid);
          if (idx !== -1) {
            clone.splice(idx, 1);
          }
        });

        if (clone.length === list.length) {
          return;
        }

        propsRef.current.onChange(clone);
        self.handleUnselectAll();
        self.handleValidate();
      },
      handleRemove(item) {
        const list = propsRef.current.value;
        const idx = list.findIndex(i => i.uuid === item.uuid);
        if (idx !== -1) {
          const clone = list.slice();
          clone.splice(idx, 1);

          propsRef.current.onChange(clone);
          self.handleValidate();
        }
      },
      handleConcat(items) {
        if (!items.length) {
          return;
        }

        const list = propsRef.current.value;
        const clone = list.concat(
          items.map(i => {
            return {
              ...i,
              uuid: v4(),
            };
          })
        );

        propsRef.current.onChange(clone);
        self.handleValidate();
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
          self.handleValidate();
        });
      },
      handleValidate() {
        // 触发验证
        formModel.validateFieldRecursive(self.getPath());
      },
      handleChange(list: T[]) {
        propsRef.current.onChange(list);

        // 触发验证
        self.handleValidate();
      },
      handleRenderItem(item, index) {
        return propsRef.current.renderItem(item, index);
      },
      handleRenderEditor(basePath, value) {
        return propsRef.current.renderEditor(basePath, value);
      },
    } satisfies MemberListContext<T>;

    return { context: self, setReadonly };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setReadonly(readonly);
  }, [readonly, setReadonly]);

  return (
    <div className={classNames('vd-member-list', s.root, className)} style={style}>
      <SortableList<T, MemberListContext<T>>
        value={value}
        onChange={context.handleChange}
        id="uuid"
        Item={Member}
        context={context}
      ></SortableList>
      <Space size="small" direction="vertical" className="u-fw">
        <Button
          className={classNames('vd-member-list__add', s.add)}
          onClick={context.handleCreate}
          disabled={disabled}
          block
        >
          {addText ?? '添加属性'}
        </Button>
        {!!context.selecting && (
          <Button danger block disabled={!context.selected.length} onClick={context.handleRemoveSelected}>
            删除
          </Button>
        )}
        {typeof children === 'function' ? children(context) : children}
      </Space>
      {editorDisplayType === 'portal' && (
        <MemberEditor list={value} path={path} ref={editorRef} title={editorTitle} onHide={context.handleEditHided}>
          {renderEditor}
        </MemberEditor>
      )}
    </div>
  );
});
