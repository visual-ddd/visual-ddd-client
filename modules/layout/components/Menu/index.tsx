import { Menu, MenuProps } from 'antd';
import { useRouter } from 'next/router';
import { ApartmentOutlined, DesktopOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { ParsedUrlQueryInput } from 'querystring';

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

  const items: MenuItem[] = [
    getItem('系统管理', '/system', <DesktopOutlined />),
    getItem('用户管理', '/system/user', <UserOutlined />),
    getItem('组织管理', '/organization/[id]/list', <ApartmentOutlined />),
    getItem('团队管理', '/team/[id]', <TeamOutlined />, [
      getItem('domain业务域', '/team/[id]/domain'),
      getItem('app业务域', '/team/[id]/app'),
    ]),
  ];

  const onMenu: MenuProps['onClick'] = e => {
    const query: string | ParsedUrlQueryInput | null | undefined = {};
    // TODO:id从启动页获取,路由逻辑后续优化
    if (e.key.indexOf('/organization/[id]') === 0) {
      query.id = '1';
    }
    if (e.key.indexOf('/team/[id]') === 0) {
      query.id = '2';
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
