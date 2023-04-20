import { formatDate } from '@wakeapp/utils';
import { Alert, Button, Modal, message } from 'antd';

import { useDesignerContext } from '../BaseDesignerContext';
import { HistoryItem } from '../HistoryManager';
import s from './HistoryView.module.scss';

export interface HistoryViewProps {
  onReverse: (item: HistoryItem) => void;
}

export const HistoryView = (props: HistoryViewProps) => {
  const { onReverse } = props;
  const designModel = useDesignerContext();
  const history = designModel.historyManager;
  const remote = history.remote;
  const local = history.local;

  const remoteInHistory = remote && history.history.some(i => i.hash === remote?.hash);
  const localInHistory = local && history.history.some(i => i.hash === local?.hash);

  const handleReverse = (item: HistoryItem) => {
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

  return (
    <div className={s.root}>
      <div className={s.list}>
        {!localInHistory && local && (
          <div className={s.item}>
            <span className={s.date}>当前</span>
            <div className={s.extra}>
              {history.isSynced && <span className={s.remote}>线上</span>}
              <span className={s.hash}>{local.hash.slice(-8)}</span>
            </div>
          </div>
        )}
        {!remoteInHistory && remote && !history.isSynced && (
          <div className={s.item}>
            <span className={s.date}>线上</span>
            <div className={s.extra}>
              <span className={s.hash}>{remote.hash.slice(-8)}</span>
            </div>
            <div className={s.actions}>
              <Button onClick={() => handleReverse(remote)} type="primary">
                回退到该版本
              </Button>
            </div>
          </div>
        )}
        {history.history.map(i => {
          const isRemote = remote && remote.hash === i.hash;
          const isLocal = local && local.hash === i.hash;
          return (
            <div key={i.hash} className={s.item}>
              <span className={s.date}>{formatDate(i.createDate, 'MM-DD HH:mm')}</span>
              <div className={s.extra}>
                {isRemote && <span className={s.remote}>线上</span>}
                {isLocal && <span className={s.local}>当前</span>}
                {!!i.note && <span className={s.note}>{i.note}</span>}
                <span className={s.hash}>{i.hash.slice(-8)}</span>
              </div>
              {!isLocal && (
                <div className={s.actions}>
                  {/* <Button onClick={() => handleReverse(i)} danger>
                    删除
                  </Button> */}
                  <Button onClick={() => handleReverse(i)} type="primary">
                    回退到该版本
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={s.body}>
        <Alert banner type="warning" message="当前历史记录保存在客户端本地"></Alert>
        <div className={s.content}>对比功能正在开发中... 敬请期待</div>
      </div>
    </div>
  );
};
