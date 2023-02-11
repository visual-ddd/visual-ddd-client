import { VersionStatusColor, VersionStatusMap } from '@/lib/core';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { useRefValue } from '@wakeapp/hooks';
import { booleanPredicate, NoopArray } from '@wakeapp/utils';
import { Modal, Button } from 'antd';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { IVersion, VersionStatus } from './types';

export interface VersionListProps {
  onRequest: (params: { pageNo: number; pageSize: number }) => Promise<{ data: IVersion[]; total: number }>;
  /**
   * 是否可以编辑，默认为 true
   */
  editable?: boolean;
  onEdit?: (item: IVersion) => void;

  onFork?: (item: IVersion) => void;

  /**
   * 是否可以预览， 默认为 true
   */
  previewable?: boolean;
  onPreview?: (item: IVersion) => void;
  onNavigate?: (item: IVersion) => void;
}

export interface VersionListRef {
  open(): void;
  hide(): void;
}

export function useVersionListRef() {
  return useRef<VersionListRef>(null);
}

/**
 * 版本列表
 */
export const VersionList = forwardRef<VersionListRef, VersionListProps>((props, ref) => {
  const { onRequest, previewable = true, editable = true } = props;
  const propsRef = useRefValue(props);
  const [visible, setVisible] = useState(false);

  const columns = useMemo<ProColumns<IVersion>[]>(
    () => [
      {
        title: '版本号',
        dataIndex: 'currentVersion',
      },
      {
        title: '状态',
        dataIndex: 'state',
        render: (_, item) => {
          return <span style={{ color: VersionStatusColor[item.state] }}>{VersionStatusMap[item.state]}</span>;
        },
      },
      { title: '描述', dataIndex: 'description' },
      {
        title: '基版本',
        dataIndex: 'startVersion',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        title: '创建人',
        dataIndex: 'createBy',
      },
      {
        title: '操作',
        key: 'option',
        render: (_text, item, _, action) => {
          return [
            <Button
              size="small"
              type="link"
              key="detail"
              onClick={() => {
                propsRef.current?.onNavigate?.(item);
                setVisible(false);
              }}
            >
              跳转
            </Button>,
            editable && item.state === VersionStatus.UNPUBLISHED && (
              <Button
                size="small"
                type="link"
                key="edit"
                onClick={() => {
                  propsRef.current?.onEdit?.(item);
                  setVisible(false);
                }}
              >
                编辑
              </Button>
            ),
            previewable && (
              <Button
                size="small"
                type="link"
                key="preview"
                onClick={() => {
                  propsRef.current?.onPreview?.(item);
                  setVisible(false);
                }}
              >
                预览
              </Button>
            ),
            <Button
              size="small"
              type="link"
              key="create"
              onClick={() => {
                propsRef.current?.onFork?.(item);
              }}
            >
              Fork
            </Button>,
          ].filter(booleanPredicate);
        },
      },
    ],
    [propsRef, previewable, editable]
  );

  useImperativeHandle(
    ref,
    () => {
      return {
        open() {
          setVisible(true);
        },
        hide() {
          setVisible(false);
        },
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    NoopArray
  );

  return (
    <Modal
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      destroyOnClose
      title="版本历史"
      width="850px"
      bodyStyle={{ paddingTop: 20 }}
    >
      <ProTable
        cardProps={{ size: 'small' }}
        columns={columns}
        rowKey="id"
        search={false}
        size="small"
        options={false}
        request={async ({ pageSize, current }) => {
          const { data, total } = await onRequest({ pageNo: current || 1, pageSize: pageSize || 20 });

          return { success: true, data, total };
        }}
      ></ProTable>
    </Modal>
  );
});

VersionList.displayName = 'VersionList';
