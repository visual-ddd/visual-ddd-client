import { SplitBox } from '@antv/x6-react-components';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useEditorModel } from '../../Model';
import { EditorFormPortalContextProvider } from '../Form';

import s from './index.module.scss';
import { SidebarFolder } from './SidebarFolder';

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
      size={
        model.viewStore.viewState.rightSidebarFolded ? 0 : model.viewStore.viewState.inspectPanelWidth ?? SIDE_WIDTH
      }
      onResizeEnd={newSize => {
        model.commandHandler.setViewState({ key: 'inspectPanelWidth', value: newSize });
      }}
      resizable={!model.viewStore.viewState.rightSidebarFolded}
      minSize={MIN_SIDE_WIDTH}
      maxSize={MAX_SIDE_WIDTH}
    >
      <div className={classNames('vd-editor-layout__body', s.body)}>
        {toolbar && <div className={classNames('vd-editor-layout__toolbar', s.toolbar)}>{toolbar}</div>}
        <div className={classNames('vd-editor-layout__canvas', s.canvas)}>{children}</div>
        {!!left && (
          <SidebarFolder
            placement="left"
            folded={model.viewStore.viewState.leftSidebarFolded}
            onFoldedChange={folded => {
              model.commandHandler.setViewState({ key: 'leftSidebarFolded', value: folded });
            }}
          />
        )}
        <SidebarFolder
          placement="right"
          folded={model.viewStore.viewState.rightSidebarFolded}
          onFoldedChange={folded => {
            model.commandHandler.setViewState({ key: 'rightSidebarFolded', value: folded });
          }}
        />
      </div>
      <div
        className={classNames('vd-editor-layout__right-side', s.right, {
          folded: model.viewStore.viewState.rightSidebarFolded,
        })}
      >
        {right}
      </div>
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
          size={
            model.viewStore.viewState.leftSidebarFolded ? 0 : model.viewStore.viewState.sidebarPanelWidth ?? SIDE_WIDTH
          }
          resizable={!model.viewStore.viewState.leftSidebarFolded}
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
