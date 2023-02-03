import { Avatar } from 'antd';
import { AvatarSize } from 'antd/es/avatar/SizeContext';
import { UserOutlined } from '@ant-design/icons';
import s from './index.module.scss';

export interface LogoProps {
  size?: AvatarSize;
  hideTitle?: boolean;
}

export function Logo(props: LogoProps) {
  const { size = 64, hideTitle } = props;

  return (
    <div className={s.logo}>
      <Avatar size={size} icon={<UserOutlined />} />
      {!hideTitle && <div className={s.title}>Visual DDD</div>}
    </div>
  );
}
