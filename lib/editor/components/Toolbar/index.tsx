import { Toolbar } from '@antv/x6-react-components';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import Icon, {
  ZoomInOutlined,
  ZoomOutOutlined,
  RedoOutlined,
  UndoOutlined,
  CopyOutlined,
  SnippetsOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import memoize from 'lodash/memoize';

import '@antv/x6-react-components/es/menu/style/index.css';
import '@antv/x6-react-components/es/toolbar/style/index.css';
import classNames from 'classnames';

import { useCanvasModel } from '../../Canvas';

import { GrabIcon } from './GrabIcon';
import { SelectIcon } from './SelectIcon';
import s from './index.module.scss';

const Group = Toolbar.Group;
const Item = Toolbar.Item;

export const EditorToolbar = observer(function EditorToolbar() {
  const { model } = useCanvasModel();
  const editorViewStore = model.editorViewStore;

  const getDesc = useMemo(() => {
    return memoize((name: string) => {
      const desc = model.getCommandDescription(name);

      return { tooltip: `${desc.description ?? desc.title} (${desc.key})`, handler: desc.handler };
    });
  }, [model]);

  return (
    <Toolbar className={classNames('vd-editor-toolbar', s.root)} hoverEffect>
      <Group>
        <Item name="zoomIn" tooltip="缩小 (Cmd +)" icon={<ZoomInOutlined />} />
        <Item name="zoomOut" tooltip="放大 (Cmd -)" icon={<ZoomOutOutlined />} />
      </Group>
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
          disabled={!editorViewStore.canRemove}
        />
        <Item
          name="paste"
          tooltip={getDesc('paste').tooltip}
          icon={<SnippetsOutlined />}
          onClick={getDesc('paste').handler}
        />
        <Item
          name="delete"
          tooltip={getDesc('delete').tooltip}
          onClick={getDesc('delete').handler}
          icon={<DeleteOutlined />}
          disabled={!editorViewStore.canRemove}
        />
      </Group>
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
    </Toolbar>
  );
});
