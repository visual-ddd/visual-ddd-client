import classNames from 'classnames';
import { observer } from 'mobx-react';

export interface ContentProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Content = observer(function Content(props: ContentProps) {
  const { className, children, ...other } = props;
  return (
    <div className={classNames('vd-layout-content', className)} {...other}>
      {children}
    </div>
  );
});
