import { formatDate } from '@wakeapp/utils';
import { useDesignerContext } from '../BaseDesignerContext';
import s from './HistoryView.module.scss';

export const HistoryView = () => {
  const designModel = useDesignerContext();
  const history = designModel.historyManager;
  const remote = history.remote;
  const local = history.local;

  const remoteInHistory = remote && history.history.some(i => i.hash === remote?.hash);
  const localInHistory = local && history.history.some(i => i.hash === local?.hash);

  return (
    <div className={s.root}>
      <div className={s.list}>
        {!localInHistory && local && (
          <div className={s.item}>
            <span className={s.date}>本地</span>
            <div className={s.extra}>
              <span className={s.hash}>{local.hash.slice(-8)}</span>
              {history.isSynced && <span className={s.remote}>线上</span>}
            </div>
          </div>
        )}
        {!remoteInHistory && remote && !history.isSynced && (
          <div className={s.item}>
            <span className={s.date}>线上</span>
            <div className={s.extra}>
              <span className={s.hash}>{remote.hash.slice(-8)}</span>
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
                <span className={s.hash}>{i.hash.slice(-8)}</span>
                {isRemote && <span className={s.remote}>线上</span>}
                {isLocal && <span className={s.local}>本地</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className={s.body}>对比功能正在开发中... 敬请期待</div>
    </div>
  );
};
