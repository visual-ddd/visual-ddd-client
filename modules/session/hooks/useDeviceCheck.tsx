import { useRequest } from '@/modules/backend-client';
import { useSession } from './useSession';
import { useEffect } from 'react';
import { isResponseError } from '@wakeapp/wakedata-backend';
import { Button, Modal, Space } from 'antd';
import { useLogout } from './useLogout';

export function useDeviceCheck() {
  const session = useSession({
    shouldRedirect: false,
    immutable: false,
  });
  const logout = useLogout();

  const { error, mutate } = useRequest(
    session.session ? '/api/device-check' : null,
    {},
    {
      swrConfig: {
        errorRetryCount: 0,
      },
    }
  );

  const reload = () => {
    mutate();
  };

  useEffect(() => {
    if (error && isResponseError(error) && error.code === 403) {
      const modal = Modal.confirm({
        title: '警告',
        content: (
          <div>
            检测到你在多个设备上登录，请退出其他设备后重试
            <Space style={{ marginTop: '1em' }}>
              <Button onClick={reload} size="small">
                刷新看看
              </Button>
              <Button onClick={logout} size="small">
                退出登录
              </Button>
            </Space>
          </div>
        ),
        closable: false,
        footer: null,
      });

      return () => {
        modal.destroy();
      };
    }
  }, [error]);
}
