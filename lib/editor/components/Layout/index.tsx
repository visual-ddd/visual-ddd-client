import { SplitBox } from '@antv/x6-react-components';
import classNames from 'classnames';

import s from './index.module.scss';

export interface EditorLayoutProps {
  /**
   * 左侧侧边栏
   */
  left: React.ReactNode;

  /**
   * 主体
   */
  children: React.ReactNode;

  /**
   * 右侧侧边栏
   */
  right: React.ReactNode;
}

const SIDE_WIDTH = 230;
const MIN_SIDE_WIDTH = SIDE_WIDTH;
const MAX_SIDE_WIDTH = SIDE_WIDTH * 1.5;

export const EditorLayout = (props: EditorLayoutProps) => {
  const { left, children, right } = props;

  return (
    <div className={classNames('vd-editor-layout', s.root)}>
      <SplitBox split="vertical" defaultSize={SIDE_WIDTH} minSize={MIN_SIDE_WIDTH} maxSize={MAX_SIDE_WIDTH}>
        <div className={classNames('vd-editor-left-side', s.left)}>{left}</div>
        <SplitBox primary="second" defaultSize={SIDE_WIDTH} minSize={MIN_SIDE_WIDTH} maxSize={MAX_SIDE_WIDTH}>
          <div className={classNames('vd-editor-body', s.body)}>{children}</div>
          <div className={classNames('vd-editor-right-side', s.right)}>{right}</div>
        </SplitBox>
      </SplitBox>
    </div>
  );
};
