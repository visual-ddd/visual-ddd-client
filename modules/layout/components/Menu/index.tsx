import { Menu, MenuProps } from 'antd';
import { useRouter } from 'next/router';
import { ApartmentOutlined, DesktopOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { ParsedUrlQueryInput } from 'querystring';
import { useEffect, useState } from 'react';
import { getLaunchConfig } from '@/modules/user/utils';
import { ORG_TYPE } from '@/modules/user/constants';

export interface PageMenuProps {
  className?: string | undefined;
}
export function PageMenu({ className }: PageMenuProps) {
  const router = useRouter();

  type MenuItem = Required<MenuProps>['items'][number];

  function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
    return {
      key,
      icon,
      children,
      label,
    } as MenuItem;
  }

  const [items, setItem] = useState<MenuItem[]>();

  useEffect(() => {
    const launchConfig = getLaunchConfig();
    const menu: MenuItem[] = [
      getItem('系统管理', '/system', <DesktopOutlined />),
      getItem('用户管理', '/system/user', <UserOutlined />),
    ];

    if (launchConfig?.type === ORG_TYPE.ORGANIZATION || launchConfig?.type === ORG_TYPE.TEAM) {
      menu.push(getItem('组织管理', '/organization/[id]/list', <ApartmentOutlined />));
    }
    if (launchConfig?.type === ORG_TYPE.TEAM) {
      menu.push(
        getItem('团队管理', '/team/[id]', <TeamOutlined />, [
          getItem('domain业务域', '/team/[id]/domain'),
          getItem('app业务域', '/team/[id]/app'),
        ])
      );
    }
    setItem(menu);
  }, []);

  const onMenu: MenuProps['onClick'] = e => {
    const query: string | ParsedUrlQueryInput | null | undefined = {};
    const launchConfig = getLaunchConfig();
    if (!launchConfig) {
      router.push('/login');
      return;
    }
    // TODO：实际的跳转逻辑后续优化
    if (e.key.indexOf('/organization/[id]') === 0) {
      query.id = launchConfig.organizationId;
    }
    if (e.key.indexOf('/team/[id]') === 0) {
      query.id = launchConfig.organizationId;
    }

    router.push({
      pathname: e.key,
      query: query,
    });
  };

  return (
    <Menu
      theme="light"
      defaultSelectedKeys={[router.route]}
      mode="inline"
      items={items}
      onClick={onMenu}
      className={className}
    />
  );
}
