import { Button, Input, Space, Table, TableColumnType } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useRef } from 'react';

import { IUbiquitousLanguageModel, UbiquitousLanguageItem } from './types';
import s from './List.module.scss';

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

  useEffect(() => {
    if (editing) {
      elementRef.current?.focus();
    }
  }, [editing]);

  return (
    <div
      ref={elementRef}
      className={classNames('vd-ul-editable', s.editable)}
      contentEditable={editing}
      onClick={() => {
        model.setEditing({ id: item.uuid, key: name, editing: true });
      }}
      onBlur={() => {
        model.setEditing({ id: item.uuid, key: name, editing: false });
        const newValue = elementRef.current?.innerText;
        if (newValue != null && newValue !== value) {
          model.updateItem({ uuid: item.uuid, key: name, value: newValue });
        }
      }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
});

/**
 * 统一语言列表
 */
export const UbiquitousLanguage = observer(function UbiquitousLanguage(props: UbiquitousLanguageProps) {
  const { model } = props;

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

    return [
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
      {
        title: '操作',
        width: 100,
        render(_, record) {
          return (
            <Space>
              <Button type="link" onClick={() => model.removeItem(record.uuid)}>
                删除
              </Button>
            </Space>
          );
        },
      },
    ];
  }, [model]);

  return (
    <div className={classNames('vd-ul', s.root)}>
      <div className={classNames('vd-ul__actions', s.actions)}>
        <Input.Search
          size="small"
          enterButton
          className={classNames('vd-ul__search', s.search)}
          placeholder="关键字搜索"
        />
      </div>
      <div className={classNames('vd-ul__actions', s.actions)}>
        <Space>
          <Button size="small" onClick={() => model.addItem('unshift')}>
            新增一行
          </Button>
          <Button size="small" disabled={!model.selecting.length} onClick={model.removeSelecting}>
            批量删除
          </Button>
          <Button size="small">自动翻译</Button>
        </Space>
        <Space>
          <Button size="small">导入 Word</Button>
          <Button size="small">导入 Excel</Button>
          <Button size="small">导出</Button>
        </Space>
      </div>
      <div className={classNames('vd-ul__table', s.table)}>
        <Table
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
          <Button size="small" onClick={() => model.addItem('push')}>
            新增一行
          </Button>
          <Button size="small" disabled={!model.selecting.length} onClick={model.removeSelecting}>
            批量删除
          </Button>
        </Space>
      </div>
    </div>
  );
});
