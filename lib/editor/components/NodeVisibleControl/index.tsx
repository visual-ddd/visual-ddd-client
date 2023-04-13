import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { useState } from 'react';

import { useCanvasModel } from '../../Canvas';

import s from './index.module.scss';
import { useEventBusListener } from '@/lib/hooks';

export interface EditorNodeVisibleControlProps {
  /**
   * 节点 ID
   */
  node: string;

  /**
   * 包含子组件, 默认 false
   */
  includeChildren?: boolean;

  /**
   * 可见性变动
   * @param visible
   * @returns  如果返回 false 则表示自定义调整可见性逻辑
   */
  onVisibleChange?: (visible: boolean) => void | false;
}

export const EditorNodeVisibleControl = observer(function EditorNodeVisibleControl(
  props: EditorNodeVisibleControlProps
) {
  const { node, includeChildren, onVisibleChange } = props;
  const { model: canvasModel } = useCanvasModel();
  const [visible, setVisible] = useState(() => canvasModel.getNodeVisible(node));

  const toggleVisible = (evt: React.MouseEvent) => {
    evt.stopPropagation();

    const nextValue = !visible;
    const prevent = onVisibleChange?.(nextValue);
    if (prevent !== false) {
      canvasModel.handleSetNodeVisible({ id: node, includeChildren, visible: nextValue });
    }
    setVisible(nextValue);
  };

  useEventBusListener(
    canvasModel.event,
    on => {
      on('NODE_VISIBLE_CHANGE', params => {
        if (params.id === node) {
          setVisible(params.visible);
        }
      });
    },
    [node]
  );

  return (
    <div className={classNames('vd-node-visible-control', s.root, { visible })} onClick={toggleVisible}>
      {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
    </div>
  );
});
