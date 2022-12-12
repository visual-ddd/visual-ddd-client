import classNames from 'classnames';

import s from './index.module.scss';

export interface ComponentsProps {
  children?: React.ReactNode;
}

export const ComponentContainer = (props: ComponentsProps) => {
  return <div className={classNames('vd-editor-components', s.root)}>{props.children}</div>;
};
