import { notification } from 'antd';
import { useEffect, useRef } from 'react';
import { useOffline } from '@/lib/hooks';
import { useRefValue } from '@wakeapp/hooks';

export interface OfflineTipProps {
  title?: React.ReactNode;
  message?: React.ReactNode;
  onOnline?: () => void;
}

export const OfflineTip = (props: OfflineTipProps) => {
  const { title, message, onOnline } = props;
  const offline = useOffline();
  const [api, holder] = notification.useNotification();
  const offlineRef = useRef(offline);
  const onOnlineRef = useRefValue(onOnline);

  useEffect(() => {
    if (offline) {
      api.warning({
        key: 'offlineTip',
        message: title ?? '掉线啦',
        description: message ?? '您已经离线，请检查网络连接',
        duration: 10,
      });
      offlineRef.current = true;

      return () => {
        api.destroy('offlineTip');
      };
    } else if (offlineRef.current) {
      // 从离线回复
      offlineRef.current = false;
      onOnlineRef.current?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offline]);

  return holder;
};
