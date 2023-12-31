import { observer } from 'mobx-react';
import { Toolbar, Menu } from '@antv/x6-react-components';
import Icon, {
  ZoomInOutlined,
  ZoomOutOutlined,
  RedoOutlined,
  UndoOutlined,
  CopyOutlined,
  SnippetsOutlined,
  DeleteOutlined,
  ExpandOutlined,
  LockOutlined,
} from '@ant-design/icons';

import '@antv/x6-react-components/es/menu/style/index.css';
import '@antv/x6-react-components/es/toolbar/style/index.css';
import classNames from 'classnames';

import { useCanvasModel } from '../../Canvas';

import { GrabIcon } from './GrabIcon';
import { SelectIcon } from './SelectIcon';
import s from './index.module.scss';
import { useCanvasModelCommandDescription } from '../../hooks';

const Group = Toolbar.Group;
const Item = Toolbar.Item;

const ZOOM_FACTOR_STYLE: React.CSSProperties = {
  width: 35,
};

export interface EditorToolbarProps {
  children?: React.ReactNode;
}

export const EditorToolbar = observer(function EditorToolbar(props: EditorToolbarProps) {
  const { children } = props;
  const { model } = useCanvasModel();
  const editorViewStore = model.editorViewStore;
  const readonly = model.readonly;

  const getDesc = useCanvasModelCommandDescription();

  const handleZoomTo = (value?: string) => {
    if (!value) {
      return;
    }

    const v = parseInt(value, 10) / 100;

    model.handleZoomTo(v);
  };

  return (
    <Toolbar className={classNames('vd-editor-toolbar', s.root)} hoverEffect>
      <Group>
        <Item
          name="zoomIn"
          tooltip={getDesc('zoomIn').tooltip}
          onClick={getDesc('zoomIn').handler}
          icon={<ZoomInOutlined />}
        />
        <Item
          name="zoom"
          tooltip="缩放 (Ctrl + MouseWheel)"
          tooltipAsTitle
          onClick={handleZoomTo}
          dropdown={
            <Menu>
              <Menu.Item name="10">10%</Menu.Item>
              <Menu.Item name="30">30%</Menu.Item>
              <Menu.Item name="50">50%</Menu.Item>
              <Menu.Item name="75">75%</Menu.Item>
              <Menu.Item name="100">100%</Menu.Item>
              <Menu.Item name="150">150%</Menu.Item>
              <Menu.Item name="200">200%</Menu.Item>
            </Menu>
          }
        >
          <span style={ZOOM_FACTOR_STYLE}>{editorViewStore.zoomFactor}%</span>
        </Item>
        <Item
          name="zoomOut"
          tooltip={getDesc('zoomOut').tooltip}
          onClick={getDesc('zoomOut').handler}
          icon={<ZoomOutOutlined />}
        />
        <Item
          name="zoomToFit"
          tooltip={getDesc('zoomToFit').tooltip}
          onClick={getDesc('zoomToFit').handler}
          icon={<ExpandOutlined />}
        ></Item>
      </Group>
      {!readonly && (
        <>
          <Group>
            <Item
              name="undo"
              tooltip={getDesc('undo').tooltip}
              onClick={getDesc('undo').handler}
              icon={<UndoOutlined />}
              disabled={!editorViewStore.canUndo}
            />
            <Item
              name="redo"
              tooltip={getDesc('redo').tooltip}
              onClick={getDesc('redo').handler}
              icon={<RedoOutlined />}
              disabled={!editorViewStore.canRedo}
            />
          </Group>
          <Group>
            <Item
              name="copy"
              tooltip={getDesc('copy').tooltip}
              onClick={getDesc('copy').handler}
              icon={<CopyOutlined />}
              disabled={!model.canCopy()}
            />
            <Item
              name="paste"
              tooltip={getDesc('paste').tooltip}
              icon={<SnippetsOutlined />}
              onClick={getDesc('paste').handler}
            />
            <Item
              name="lock"
              tooltip={getDesc('lock').tooltip}
              active={model.isLocked()}
              icon={<LockOutlined />}
              disabled={!model.canLockOrUnlock()}
              onClick={getDesc('lock').handler}
            ></Item>
            <Item
              name="delete"
              tooltip={getDesc('delete').tooltip}
              onClick={getDesc('delete').handler}
              icon={<DeleteOutlined />}
              disabled={!model.canRemove()}
            />
          </Group>
        </>
      )}

      <Group>
        <Item
          name="mousePanningMode"
          tooltip={getDesc('mousePanningMode').tooltip}
          onClick={getDesc('mousePanningMode').handler}
          icon={<Icon component={GrabIcon}></Icon>}
          active={editorViewStore.viewState.mouseDragMode === 'panning'}
        ></Item>
        <Item
          name="mouseSelectMode"
          tooltip={getDesc('mouseSelectMode').tooltip}
          onClick={getDesc('mouseSelectMode').handler}
          icon={<Icon component={SelectIcon}></Icon>}
          active={editorViewStore.viewState.mouseDragMode === 'select'}
        ></Item>
      </Group>
      {children}
    </Toolbar>
  );
});
