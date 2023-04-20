import { formatDate } from '@wakeapp/utils';
import { Alert, Empty, Button, Modal, message } from 'antd';
import { useMemo, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { useDesignerContext } from '../BaseDesignerContext';
import { HistoryItem } from '../HistoryManager';
import s from './HistoryView.module.scss';
import { DiffView } from './DiffView';
import { VersionSelect } from './VersionSelect';
import { ArrowRightOutlined } from '@ant-design/icons';

export interface HistoryViewProps {
  onReverse: (item: HistoryItem) => void;
}

export const HistoryView = observer(function HistoryView(props: HistoryViewProps) {
  const { onReverse } = props;
  const designModel = useDesignerContext();
  const history = designModel.historyManager;
  const [selectedHash, setSelectedHash] = useState<string | undefined>();
  const [compareHash, setCompareHash] = useState<string | undefined>();

  const selected = useMemo(() => {
    if (!history.list.length) {
      return undefined;
    }

    const getFallback = () => {
      const local = history.list.find(i => i.local);
      if (local) {
        return local;
      } else {
        return history.list[0];
      }
    };

    if (selectedHash == null) {
      return getFallback();
    }

    const item = history.list.find(i => i.hash === selectedHash);
    if (item) {
      return item;
    }

    return getFallback();
  }, [selectedHash, history.list]);

  const compare = useMemo(() => {
    return history.list.find(i => i.hash === compareHash);
  }, [compareHash, history.list]);

  const handleReverse = () => {
    const item = selected;
    if (item == null) {
      return;
    }

    Modal.confirm({
      title: '确定要回退到该版本吗？',
      onOk: () => {
        try {
          designModel.reverseToSnapshot(item);
          onReverse(item);
          message.success('版本回退成功');
        } catch (err) {
          message.success((err as Error).message);
        }
      },
    });
  };

  const handleRemove = () => {
    const item = selected;
    if (item == null) {
      return;
    }

    Modal.confirm({
      title: '确定要删除该版本吗？',
      onOk: () => {
        try {
          history.removeHistory(item.hash);
          message.success('版本删除成功');
        } catch (err) {
          message.success((err as Error).message);
        }
      },
    });
  };

  const handleSelect = (item: HistoryItem) => {
    setCompareHash(undefined);
    setSelectedHash(item.hash);
  };

  return (
    <div className={s.root}>
      <div className={s.list}>
        {history.list.map(i => {
          return (
            <div
              key={i.hash}
              className={classNames(s.item, { [s.selected]: selected?.hash === i.hash })}
              onClick={() => handleSelect(i)}
            >
              <span className={s.date}>{formatDate(i.createDate, 'MM-DD HH:mm')}</span>
              <div className={s.extra}>
                {i.remote && <span className={s.remote}>线上</span>}
                {i.local && <span className={s.local}>当前</span>}
                {!!i.note && <span className={s.note}>{i.note}</span>}
                <span className={s.hash}>{i.hash.slice(-8)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className={s.body}>
        <Alert banner type="warning" message="当前历史记录保存在客户端本地, 后续我们将支持远程保存, 敬请期待"></Alert>
        {selected == null ? (
          <Empty description="请选择版本"></Empty>
        ) : (
          <div className={s.content}>
            <div className={s.actions}>
              <div className={s.actionLeft}>
                <VersionSelect value={selected.hash} disabled className={s.versionSelect} />
                <ArrowRightOutlined className={s.arrow} />
                <VersionSelect
                  value={compare?.hash}
                  ignoreHash={selected.hash}
                  onChange={v => setCompareHash(v)}
                  className={s.versionSelect}
                  allowClear
                />
              </div>
              <div className={s.actionRight}>
                {selected.removable && (
                  <Button danger onClick={handleRemove}>
                    删除
                  </Button>
                )}
                {selected.recoverable && (
                  <Button type="primary" onClick={handleReverse}>
                    恢复此版本
                  </Button>
                )}
              </div>
            </div>
            <DiffView />
          </div>
        )}
      </div>
    </div>
  );
});
