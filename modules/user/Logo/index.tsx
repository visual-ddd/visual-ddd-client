import { Avatar } from 'antd';
import { AvatarSize } from 'antd/es/avatar/SizeContext';
import { UserOutlined } from '@ant-design/icons';
import s from './index.module.scss';
import classNames from 'classnames';

export interface LogoProps {
  /**
   * logo尺寸
   */
  size?: AvatarSize;
  /**
   * 是否隐藏标题
   */
  hideTitle?: boolean;
  /**
   * 是否水平展示
   */
  horizontal?: boolean;
}

export function Logo(props: LogoProps) {
  const { size = 64, hideTitle, horizontal } = props;

  return (
    <div className={classNames(s.logo, { [s.horizontal]: horizontal })}>
      <Avatar size={size} icon={<UserOutlined />} />
      {!hideTitle && <div className={s.title}>Visual DDD</div>}
    </div>
  );
}
