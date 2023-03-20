import { Button, Input, Popconfirm, Space, Table, TableColumnType } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useRef } from 'react';
import { Clipboard } from '@/lib/utils';
import { v4 } from 'uuid';

import { IUbiquitousLanguageModel, UbiquitousLanguageItem } from './types';
import { Import } from '@/lib/components/Import';

import s from './List.module.scss';
import { AIImport, useAIImport } from './AIImport';

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

/**
 * 统一语言列表
 */
export const UbiquitousLanguage = observer(function UbiquitousLanguage(props: UbiquitousLanguageProps) {
  const { model } = props;
  const readonly = model.readonly;
  const aiImportRef = useAIImport();

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

    return list;
  }, [model]);

  const disabledBatchOperation = !model.selecting.length || readonly;

  const unshiftItems = (items: UbiquitousLanguageItem[]) => {
    for (const item of items) {
      model.addItem('unshift', item);
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

  return (
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
          <Button
            size="small"
            disabled={readonly}
            onClick={() => {
              aiImportRef.current?.open();
            }}
          >
            AI 导入
          </Button>
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
      <div className={classNames('vd-ul__table', s.table)}>
        <Table
          loading={model.loading}
          rowKey="uuid"
          rowSelection={{ selectedRowKeys: model.selecting, onChange: e => model.setSelecting(e as string[]) }}
          columns={columns}
          size="small"
          dataSource={model.list}
          pagination={false}
        ></Table>
      </div>
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
      <AIImport ref={aiImportRef} onImport={unshiftItems} />
    </div>
  );
});
