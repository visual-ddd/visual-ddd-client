import classNames from 'classnames';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import { memo } from 'react';

import s from './index.module.scss';

export interface EditorPanelProps {
  className?: string;
  style?: React.CSSProperties;

  /**
   * 标题
   */
  title: React.ReactNode;

  children?: React.ReactNode;

  /**
   * 折叠状态, 默认 false
   */
  folded?: boolean;

  /**
   * 折叠状态变动
   * @param folded
   * @returns
   */
  onFoldChange?: (folded: boolean) => void;
}

export const EditorPanel = memo((props: EditorPanelProps) => {
  const { className, folded, onFoldChange, title, children, ...other } = props;

  const handleFoldClick = () => {
    onFoldChange?.(!folded);
  };

  return (
    <div className={classNames('vd-editor-panel', className, s.root)} {...other}>
      <div className={classNames('vd-editor-panel__header', s.header)} onClick={handleFoldClick}>
        <span className={classNames('vd-editor-panel__title', s.title)}>{title}</span>
        {folded ? <RightOutlined /> : <DownOutlined />}
      </div>
      <div className={classNames('vd-editor-panel__body', s.body, { [s.bodyFolded]: folded })}>{children}</div>
    </div>
  );
});

EditorPanel.displayName = 'EditorPanel';
