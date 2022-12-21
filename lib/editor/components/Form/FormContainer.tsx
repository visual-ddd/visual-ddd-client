import classNames from 'classnames';
import { memo } from 'react';

import s from './FormContainer.module.scss';

export interface EditorFormContainerProps {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

export const EditorFormContainer = memo((props: EditorFormContainerProps) => {
  const { className, ...other } = props;
  return <div className={classNames('vd-form-container', className, s.root)} {...other}></div>;
});

EditorFormContainer.displayName = 'EditorFormContainer';
