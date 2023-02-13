import { message, Modal, Table, TableColumnProps } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import type { IVersion } from '@/lib/components/VersionControl/types';
import { NoopObject } from '@wakeapp/utils';
import classNames from 'classnames';

import { VersionSelect } from './VersionSelect';
import s from './index.module.scss';

export interface IAssociable {
  id: number;
  name: string;
  version?: IVersion;
}

export interface AssociationProps {
  /**
   * 只读模式，默认 false
   */
  readonly?: boolean;

  /**
   * 唯一 id, 用于 swr 缓存
   */
  identify: string;

  /**
   * 名称，用于标题展示
   */
  name: React.ReactNode;

  /**
   * 获取组件列表
   * @returns
   */
  onRequest: () => Promise<IAssociable[]>;

  /**
   * 获取组件版本
   * @param id
   * @returns
   */
  onRequestVersions: (id: number) => Promise<IVersion[]>;

  /**
   * 触发保存
   * @param mapper
   * @returns
   */
  onFinish: (result: { mapper: Record<string, number | undefined>; versionIds: number[] }) => void;
}

export interface AssociationRef {
  open(): void;
}

export function useAssociation() {
  const ref = useRef<AssociationRef>(null);

  return ref;
}

/**
 * 应用组件关联
 */
export const Association = forwardRef<AssociationRef, AssociationProps>((props, ref) => {
  const { identify, name, onRequestVersions, onFinish, onRequest, readonly = false } = props;
  const [visible, setVisible] = useState(false);
  const [datasource, setDatasource] = useState<IAssociable[]>([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mapper, setMapper] = useState<Record<string, number | undefined>>(NoopObject);

  useImperativeHandle(ref, () => {
    return {
      open() {
        setVisible(true);
      },
    };
  });

  const fetch = async () => {
    try {
      // 重置
      setMapper(NoopObject);

      setFetching(true);
      const data = await onRequest();
      setDatasource(data);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setFetching(false);
    }
  };

  const columns = useMemo<TableColumnProps<IAssociable>[]>(() => {
    return [
      {
        dataIndex: 'name',
        title: name,
      },
      {
        dataIndex: 'version',
        title: '版本号',
        width: '200px',
        render(_, row) {
          const value = row.id in mapper ? mapper[row.id] : row.version?.id;
          const handleChange = (value: string) => {
            setMapper(old => {
              return { ...old, [row.id]: value };
            });
          };

          return (
            <VersionSelect
              disabled={readonly}
              value={value}
              onChange={handleChange}
              identify={`${identify}.${row.id}`}
              onRequest={() => {
                return onRequestVersions(row.id);
              }}
            />
          );
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, identify, readonly]);

  useEffect(() => {
    if (visible) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSave = async () => {
    if (!Object.keys(mapper).length) {
      // 未变更
      setVisible(false);
      return;
    }

    const inMapper: Record<string, number | undefined> = {};
    const inArray: number[] = [];

    for (const item of datasource) {
      const id = item.id;
      if (id in mapper) {
        // 已修改
        const changed = mapper[id];
        inMapper[id] = changed;
        if (changed != null) {
          inArray.push(changed);
        }
      } else {
        // 未修改
        const version = item.version;
        inMapper[id] = version?.id;
        if (version) {
          inArray.push(version.id);
        }
      }
    }

    try {
      setSaving(true);
      await onFinish({
        mapper: inMapper,
        versionIds: inArray,
      });
      setVisible(false);
      message.success('保存成功');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      className={classNames('vd-association', s.root)}
      open={visible}
      title={<span>关联{name}</span>}
      footer={readonly ? null : undefined}
      okText="保存"
      confirmLoading={saving}
      onOk={handleSave}
      onCancel={handleCancel}
      destroyOnClose
    >
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        columns={columns}
        loading={fetching}
        dataSource={datasource}
      ></Table>
    </Modal>
  );
});

Association.displayName = 'Association';
