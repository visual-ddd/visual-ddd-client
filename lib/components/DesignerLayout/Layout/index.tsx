import { Tabs, TabsProps } from 'antd';
import s from './index.module.scss';

export interface DesignerLayoutProps {
  children?: React.ReactNode;
  items: TabsProps['items'];
  activeKey?: string;
  onActiveKeyChange?: (key: string) => void;
}

export const DesignerLayout = (props: DesignerLayoutProps) => {
  const { children, items, activeKey, onActiveKeyChange } = props;
  return (
    <div className={s.root}>
      {children}
      <Tabs
        className={s.body}
        items={items}
        tabPosition="bottom"
        activeKey={activeKey}
        onChange={onActiveKeyChange}
        tabBarGutter={20}
        size="small"
      ></Tabs>
    </div>
  );
};
