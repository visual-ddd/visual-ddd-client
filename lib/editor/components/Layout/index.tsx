import { SplitBox } from '@antv/x6-react-components';
import classNames from 'classnames';
import { EditorFormPortalContextProvider } from '../Form';

import s from './index.module.scss';

export * from './PanelLayout';

export interface EditorLayoutProps {
  /**
   * 左侧侧边栏
   */
  left: React.ReactNode;

  /**
   * 工具栏
   */
  toolbar?: React.ReactNode;

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

// TODO: 记忆
export const EditorLayout = (props: EditorLayoutProps) => {
  const { left, children, toolbar, right } = props;
  const content = (
    <SplitBox primary="second" defaultSize={SIDE_WIDTH} minSize={MIN_SIDE_WIDTH} maxSize={MAX_SIDE_WIDTH}>
      <div className={classNames('vd-editor-layout__body', s.body)}>
        {toolbar && <div className={classNames('vd-editor-layout__toolbar', s.toolbar)}>{toolbar}</div>}
        <div className={classNames('vd-editor-layout__canvas', s.canvas)}>{children}</div>
      </div>
      <div className={classNames('vd-editor-layout__right-side', s.right)}>{right}</div>
    </SplitBox>
  );

  return (
    <EditorFormPortalContextProvider
      className={classNames('vd-editor-layout', s.root)}
      target=".vd-editor-layout__canvas"
    >
      {left ? (
        <SplitBox split="vertical" defaultSize={SIDE_WIDTH} minSize={MIN_SIDE_WIDTH} maxSize={MAX_SIDE_WIDTH}>
          <div className={classNames('vd-editor-layout__left-side', s.left)}>{left}</div>
          {content}
        </SplitBox>
      ) : (
        content
      )}
    </EditorFormPortalContextProvider>
  );
};
