import { SplitBox } from '@antv/x6-react-components';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEditorModel } from '../../Model';
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

export const EditorLayout = observer(function EditorLayout(props: EditorLayoutProps) {
  const { left, children, toolbar, right } = props;
  const { model } = useEditorModel();

  const content = (
    <SplitBox
      primary="second"
      size={model.viewStore.viewState.inspectPanelWidth ?? SIDE_WIDTH}
      onResizeEnd={newSize => {
        model.commandHandler.setViewState({ key: 'inspectPanelWidth', value: newSize });
      }}
      minSize={MIN_SIDE_WIDTH}
      maxSize={MAX_SIDE_WIDTH}
    >
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
        <SplitBox
          split="vertical"
          size={model.viewStore.viewState.sidebarPanelWidth ?? SIDE_WIDTH}
          onResizeEnd={newSize => {
            model.commandHandler.setViewState({ key: 'sidebarPanelWidth', value: newSize });
          }}
          minSize={MIN_SIDE_WIDTH}
          maxSize={MAX_SIDE_WIDTH}
        >
          <div className={classNames('vd-editor-layout__left-side', s.left)}>{left}</div>
          {content}
        </SplitBox>
      ) : (
        content
      )}
    </EditorFormPortalContextProvider>
  );
});
