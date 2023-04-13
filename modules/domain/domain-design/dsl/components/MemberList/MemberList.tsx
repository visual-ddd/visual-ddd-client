import React, { useEffect, useMemo, useRef } from 'react';
import { Button, Checkbox, Dropdown, message, Space } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { EditTwoTone, EllipsisOutlined } from '@ant-design/icons';
import { action, observable } from 'mobx';
import { useRefValue } from '@wakeapp/hooks';
import { NoopArray, cloneDeep } from '@wakeapp/utils';
import { v4 } from 'uuid';
import { Clipboard, getPathSegmentByIndex, getPathLength } from '@/lib/utils';
import { EditorFormTooltip, useEditorFormContext, usePropertyLocationSatisfy } from '@/lib/editor';
import { scrollIntoView } from '@/lib/dom';
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
   * 重复属性
   * @param item
   * @returns
   */
  handleDuplicate: (item: T) => void;

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

const DROPDOWN_TRIGGER = ['click' as const, 'contextMenu' as const];

const Member = observer(function Member<T extends IDDSL>(props: {
  value: T;
  context: MemberListContext<T>;
  index: number;
}) {
  const { value, context, index } = props;
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
  };

  const handleRemove = () => {
    context.handleRemove(value);
  };

  const handleDuplicate = () => {
    context.handleDuplicate(value);
  };

  const handleSelectedChange = (evt: React.MouseEvent) => {
    // evt.preventDefault();
    // (evt.currentTarget as HTMLDivElement)?.focus();

    if (!selecting) {
      return;
    }

    evt.stopPropagation();

    context.handleToggleSelected(value);
  };

  const handleMouseUp = (evt: React.KeyboardEvent) => {
    if (evt.target !== evt.currentTarget) {
      return;
    }

    let matched = true;
    switch (evt.key) {
      case 'Enter':
        handleEdit();
        break;
      case 'Backspace':
        handleRemove();
        break;
      default:
        matched = false;
        break;
    }

    if (matched) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  };

  return (
    <div
      className={classNames('vd-member-list-item', s.item, { editing: editing && !selecting, selected })}
      tabIndex={0}
      title={selecting ? '点击选择' : '双击编辑'}
      onDoubleClick={handleEdit}
      onClickCapture={handleSelectedChange}
      data-member-id={value.uuid}
      onKeyDown={handleMouseUp}
    >
      {readonly ? null : selecting ? (
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
          {showError && <EditorFormTooltip path={pathWithIndex} aggregated></EditorFormTooltip>}
          {popoverEdit ? (
            <Dropdown
              trigger={DROPDOWN_TRIGGER}
              destroyPopupOnHide
              open={editing}
              onOpenChange={v => {
                if (!v) {
                  context.handleEditHided();
                } else {
                  handleEdit();
                }
              }}
              arrow
              dropdownRender={() => {
                // Dropdown 会拦截处理 Tab 快捷键，因此这里禁止冒泡
                const handleKeyDown = (evt: React.KeyboardEvent) => {
                  if (evt.key === 'Tab') {
                    evt.stopPropagation();
                  }
                };

                return (
                  <div className={s.popoverEditor} onKeyDown={handleKeyDown}>
                    <header className={s.popoverEditorHeader}>{context.getEditorTitle()}</header>
                    <div className={s.popoverEditorBody}>{context.handleRenderEditor(pathWithIndex, value)}</div>
                  </div>
                );
              }}
              placement="bottomRight"
            >
              <EditTwoTone onClick={handleEdit} />
            </Dropdown>
          ) : (
            <EditTwoTone onClick={handleEdit} />
          )}
          {!readonly && (
            <Dropdown
              destroyPopupOnHide
              placement="topRight"
              trigger={DROPDOWN_TRIGGER}
              menu={{
                items: [
                  {
                    key: 'duplicate',
                    label: '重复',
                    onClick: handleDuplicate,
                  },
                  {
                    key: 'remove',
                    label: '删除',
                    danger: true,
                    onClick: handleRemove,
                  },
                ],
              }}
            >
              <EllipsisOutlined className={s.menu} />
            </Dropdown>
          )}
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

export function renderActions<T extends IDDSL>(context: MemberListContext<T>, clipboard: Clipboard<T>) {
  if (context.readonly) {
    return null;
  }

  const paste = !clipboard.isEmpty && (
    <span
      className="u-link"
      onClick={() => {
        context.handleConcat(clipboard.get());
      }}
    >
      粘贴
    </span>
  );

  return (
    <Space size="small" className={s.actions}>
      {context.selecting ? (
        <>
          {paste}
          <span
            className="u-link"
            onClick={() => {
              if (context.selected) {
                clipboard.save(context.selected);
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
          {paste}
          <span
            className="u-link"
            onClick={() => {
              if (context.list.length) {
                clipboard.save(context.list);
                message.success('已复制所有属性');
              }
            }}
          >
            复制所有
          </span>
          <span className="u-link" onClick={context.handleToggleSelecting}>
            编辑
          </span>
        </>
      )}
    </Space>
  );
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

    const selectItems = action('SELECT_ITEMS', (items: T[]) => {
      store.selected = items;
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
      handleDuplicate(item) {
        const newItem = cloneDeep(item);
        newItem.uuid = v4();

        const list = propsRef.current.value;
        const idx = list.findIndex(i => i.uuid === item.uuid);
        const insertIdx = idx === -1 ? list.length : idx + 1;

        const clone = list.slice();
        clone.splice(insertIdx, 0, newItem);

        propsRef.current.onChange(clone);

        self.handleValidate();
      },
      handleConcat(items) {
        if (!items.length) {
          return;
        }

        const list = propsRef.current.value;
        const newItems = items.map(i => {
          return {
            ...i,
            uuid: v4(),
          };
        });

        const clone = list.concat(newItems);

        propsRef.current.onChange(clone);
        self.handleValidate();

        // 选中刚编辑的元素
        if (self.selecting) {
          selectItems(newItems);
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

  usePropertyLocationSatisfy({
    nodeId: formModel.id,
    path,
    onSatisfy: evt => {
      if (evt.location.path === path) {
        return;
      }

      // 获取子项索引
      const index = getPathSegmentByIndex(evt.location.path!, getPathLength(path));
      if (index == null) {
        return;
      }

      // 打开子项
      const item = props.value?.[Number(index)];
      if (item) {
        context.handleEdit(item);
        // 滚动显示
        requestAnimationFrame(() => {
          scrollIntoView(`[data-member-id='${item.uuid}']`);
        });
      }
    },
  });

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
          disabled={disabled || readonly}
          block
        >
          {addText ?? '添加属性'}
        </Button>
        {!!context.selecting && (
          <Button danger block disabled={!context.selected.length || readonly} onClick={context.handleRemoveSelected}>
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
