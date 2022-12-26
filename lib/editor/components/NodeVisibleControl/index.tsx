import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { useState } from 'react';

import { useCanvasModel } from '../../Canvas';

import s from './index.module.scss';

export interface EditorNodeVisibleControlProps {
  /**
   * 节点 ID
   */
  node: string;

  /**
   * 包含子组件, 默认 false
   */
  includeChildren?: boolean;
}

export const EditorNodeVisibleControl = observer(function EditorNodeVisibleControl(
  props: EditorNodeVisibleControlProps
) {
  const { node, includeChildren } = props;
  const { model: canvasModel } = useCanvasModel();
  const [visible, setVisible] = useState(() => canvasModel.getNodeVisible(node));

  const toggleVisible = (evt: React.MouseEvent) => {
    evt.stopPropagation();

    canvasModel.handleSetNodeVisible({ id: node, includeChildren, visible: !visible });
    setVisible(!visible);
  };

  return (
    <div className={classNames('vd-node-visible-control', s.root, { visible })} onClick={toggleVisible}>
      {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
    </div>
  );
});
