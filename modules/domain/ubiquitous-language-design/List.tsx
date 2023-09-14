import { Button, Input, Popconfirm, Space, Table, TableColumnType } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Children, useEffect, useMemo, useRef, cloneElement } from 'react';
import { Clipboard } from '@/lib/utils';
import { v4 } from 'uuid';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { BulbOutlined, MenuOutlined } from '@ant-design/icons';
import { CSS } from '@dnd-kit/utilities';

import { IUbiquitousLanguageModel, UbiquitousLanguageItem } from './types';
import { Import } from '@/lib/components/Import';

import s from './List.module.scss';
import { AIImport } from './AIImport';
import { useChatSupported } from '@/modules/chat-bot/hooks';

export interface UbiquitousLanguageProps {
  model: IUbiquitousLanguageModel;
}

const Item = observer(function Item({
  name,
  item,
  model,
}: {
  name: keyof UbiquitousLanguageItem;
  item: UbiquitousLanguageItem;
  model: IUbiquitousLanguageModel;
}) {
  const value = item[name];
  const editing = model.isEditing(item.uuid, name);
  const elementRef = useRef<HTMLDivElement>(null);
  const readonly = model.readonly;
  const enterEditing = readonly
    ? undefined
    : () => {
        model.setEditing({ id: item.uuid, key: name, editing: true });
      };

  useEffect(() => {
    if (editing) {
      elementRef.current?.focus();
      const selection = window.getSelection();
      selection?.removeAllRanges();

      const range = document.createRange();
      range.selectNodeContents(elementRef.current!);
      range.collapse();

      selection?.addRange(range);
    }
  }, [editing]);

  return (
    <div
      ref={elementRef}
      className={classNames('vd-ul-editable', s.item, { editable: !readonly })}
      contentEditable={editing}
      tabIndex={1}
      onFocus={enterEditing}
      onBlur={
        readonly
          ? undefined
          : () => {
              model.setEditing({ id: item.uuid, key: name, editing: false });
              const newValue = elementRef.current?.innerText;
              if (newValue != null && newValue !== value) {
                model.updateItem({ uuid: item.uuid, key: name, value: newValue });
              }
            }
      }
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
});

const clipboard = new Clipboard<UbiquitousLanguageItem>();

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row = ({ children, ...props }: RowProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 })?.replace(
      /translate3d\(([^,]+),/,
      'translate3d(0,'
    ),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {Children.map(children, child => {
        if ((child as React.ReactElement).key === 'sort') {
          return cloneElement(child as React.ReactElement, {
            children: (
              <MenuOutlined ref={setActivatorNodeRef} style={{ touchAction: 'none', cursor: 'move' }} {...listeners} />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

const TableSortableComponents = { body: { row: Row } };

/**
 * 统一语言列表
 */
export const UbiquitousLanguage = observer(function UbiquitousLanguage(props: UbiquitousLanguageProps) {
  const { model } = props;
  const readonly = model.readonly;
  const sortable = !!(!model.filter && model.moveItem && !readonly);
  const aiSupported = useChatSupported();

  const columns = useMemo<TableColumnType<UbiquitousLanguageItem>[]>(() => {
    const editable = (key: keyof UbiquitousLanguageItem, title: string): TableColumnType<UbiquitousLanguageItem> => {
      return {
        title,
        dataIndex: key,
        shouldCellUpdate: () => false,
        render(_, record) {
          return <Item name={key} item={record} model={model}></Item>;
        },
      };
    };
    const list: TableColumnType<UbiquitousLanguageItem>[] = [
      {
        width: 150,
        ...editable('conception', '概念'),
      },
      {
        width: 150,
        ...editable('englishName', '英文'),
      },
      {
        ...editable('definition', '定义'),
      },
      {
        ...editable('restraint', '约束'),
      },
      {
        ...editable('example', '举例'),
      },
    ];

    if (!model.readonly) {
      list.push({
        title: '操作',
        width: 100,
        render(_, record) {
          return (
            <Popconfirm title="确认删除?" onConfirm={() => model.removeItem({ uuid: record.uuid })}>
              <Button type="link">删除</Button>
            </Popconfirm>
          );
        },
      });
    }

    if (sortable) {
      list.push({
        width: 40,
        key: 'sort',
      });
    }

    return list;
  }, [model, sortable]);

  const disabledBatchOperation = !model.selecting.length || readonly;

  const unshiftItems = async (items: UbiquitousLanguageItem[]) => {
    const ids = await Promise.all(items.map(i => model.addItem('unshift', i)));

    if (ids.length) {
      model.cleanSelecting();
      model.setSelecting(ids);
    }
  };

  const handleCopy = () => {
    const selected = model.selectingItems;

    if (selected.length) {
      clipboard.save(selected);
    }
  };

  const handlePaste = async () => {
    const items = clipboard.get();

    if (items.length) {
      const itemsToPush = items.map(i => ({ ...i, uuid: v4() }));

      const ids = await Promise.all(itemsToPush.map(i => model.addItem('unshift', i)));

      if (ids.length) {
        model.cleanSelecting();
        model.setSelecting(ids);
      }
    }
  };

  let table = (
    <Table
      loading={model.loading}
      rowKey="uuid"
      rowSelection={{ selectedRowKeys: model.selecting, onChange: e => model.setSelecting(e as string[]) }}
      columns={columns}
      size="small"
      dataSource={model.list}
      pagination={false}
      components={sortable ? TableSortableComponents : undefined}
    ></Table>
  );

  let content = (
    <div className={classNames('vd-ul', s.root)}>
      <div className={classNames('vd-ul__actions', s.actions)}>
        <Input.Search
          size="small"
          enterButton
          className={classNames('vd-ul__search', s.search)}
          placeholder="关键字搜索"
          onSearch={e => model.setFilter({ value: e })}
        />
      </div>
      <div className={classNames('vd-ul__actions', s.actions)}>
        <Space>
          <Button
            size="small"
            onClick={() => (model.sortable ? model.addItem('unshift') : model.addItem('push'))}
            disabled={readonly}
          >
            新增一行
          </Button>

          <Popconfirm title="确认删除?" onConfirm={model.removeSelecting} disabled={disabledBatchOperation}>
            <Button size="small" disabled={disabledBatchOperation}>
              批量删除
            </Button>
          </Popconfirm>

          <Button size="small" disabled={disabledBatchOperation} onClick={handleCopy}>
            复制
          </Button>

          {/* <Button size="small" disabled={readonly} >
            自动翻译
          </Button> */}
        </Space>
        <Space>
          {!readonly && !clipboard.isEmpty && (
            <Popconfirm title="确认粘贴?" onConfirm={handlePaste}>
              <Button>粘贴</Button>
            </Popconfirm>
          )}

          {aiSupported && (
            <AIImport onImport={unshiftItems}>
              <Button size="small" disabled={readonly} icon={<BulbOutlined />}>
                AI 导入
              </Button>
            </AIImport>
          )}
          {!!model.importExcel && (
            <Import
              template="/excel-templates/ubiquitous-language.xlsx"
              title="导入 Excel"
              onUpload={model.importExcel}
            >
              <Button size="small" disabled={readonly}>
                导入 Excel
              </Button>
            </Import>
          )}
          {!!model.exportExcel && (
            <Button size="small" onClick={model.exportExcel} disabled={!model.list.length}>
              导出 Excel
            </Button>
          )}
        </Space>
      </div>
      <div className={classNames('vd-ul__table', s.table)}>{table}</div>
      <div className={classNames('vd-ul__actions', s.actions)}>
        <Space>
          <Button size="small" onClick={() => model.addItem('push')} disabled={readonly}>
            新增一行
          </Button>
          <Popconfirm title="确认删除?" onConfirm={model.removeSelecting} disabled={disabledBatchOperation}>
            <Button size="small" disabled={disabledBatchOperation}>
              批量删除
            </Button>
          </Popconfirm>
        </Space>
      </div>
    </div>
  );

  if (sortable) {
    const handleSortEnd = (e: DragEndEvent) => {
      const { active, over } = e;

      if (active.id !== over?.id) {
        model.moveItem?.(active.id as string, over?.id as string);
      }
    };
    content = (
      <DndContext onDragEnd={handleSortEnd}>
        <SortableContext items={model.ids} strategy={verticalListSortingStrategy}>
          {content}
        </SortableContext>
      </DndContext>
    );
  }

  return content;
});
