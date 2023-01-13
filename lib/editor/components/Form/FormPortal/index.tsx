import classNames from 'classnames';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Draggable from 'react-draggable';
import { CloseOutlined } from '@ant-design/icons';

import { useFormPortalContext } from './context';
import s from './index.module.scss';

export { EditorFormPortalContextProvider } from './context';

export interface EditorFormPortalProps {
  className?: string;
  style?: React.CSSProperties;
  value?: boolean;
  onChange?: (visible: boolean) => void;

  title: React.ReactNode;
  children: React.ReactNode;
}

const positionStore = observable({
  x: 0,
  y: 0,
});

const updatePosition = action('UPDATE_FORM_PORTAL_POSITION', (_: any, position: { x: number; y: number }) => {
  positionStore.x = position.x;
  positionStore.y = position.y;
});

/**
 * 二级表单渲染
 */
export const EditorFormPortal = observer(function EditorFormPortal(props: EditorFormPortalProps) {
  const { value, onChange, title, className, style, children } = props;
  const container = useMemo(() => {
    const el = document.createElement('div');
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.pointerEvents = 'none';
    el.style.position = 'absolute';
    el.style.left = '0px';
    el.style.top = '0px';

    return el;
  }, []);
  const context = useFormPortalContext()!;

  const handleClose = () => {
    onChange?.(false);
  };

  useEffect(() => {
    if (value) {
      return context.requestShow(container, handleClose);
    } else {
      context.requestHide(container);
    }
  }, [value]);

  return createPortal(
    <Draggable
      offsetParent={container}
      bounds="parent"
      handle=".vd-form-portal__header"
      position={positionStore}
      onStop={updatePosition}
    >
      <div className={classNames('vd-form-portal', s.root, className)} style={style}>
        <div className={classNames('vd-form-portal__header', s.header)}>
          <span className={classNames('vd-form-portal__title', s.title)}>{title}</span>
          <span className={classNames('vd-form-portal__close', s.close)} onClick={handleClose}>
            <CloseOutlined />
          </span>
        </div>
        <div className={classNames('vd-form-portal__body', s.body)}>
          {/* 按需加载 */}
          {!!value && children}
        </div>
      </div>
    </Draggable>,
    container
  );
});
