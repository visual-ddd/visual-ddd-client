import { EditorFormPortal } from '@/lib/editor';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { IDDSL } from '../../dsl';

import s from './MemberEditor.module.scss';

export interface MemberEditorProps<T extends IDDSL = any> {
  /**
   * 基础路径，用于拼接字段路径
   */
  path: string;

  list: T[];

  /**
   * 隐藏回调
   * @returns
   */
  onHide?: () => void;

  /**
   * 编辑框标题, 默认为编辑
   */
  title?: React.ReactNode;

  /**
   * 编辑内容渲染
   */
  children?: React.ReactNode | ((basePath: string, value: T) => React.ReactNode);
}

export interface MemberEditorMethods<T extends IDDSL = any> {
  show: (item: T) => void;
  hide: () => void;
}

export function useMemberEditorRef<T extends IDDSL = any>() {
  return useRef<MemberEditorMethods<T>>(null);
}

/**
 * 游离的成员编辑器
 */
export const MemberEditor = observer(
  forwardRef<MemberEditorMethods, MemberEditorProps>(function MemberEditor(props, ref) {
    const { path, list, title, children, onHide } = props;
    const [currentEditing, setCurrentEditing] = useState<IDDSL>();
    const [visible, setVisible] = useState(false);
    const [entering, setEntering] = useState(false);

    // 计算当前的索引
    const idx = useMemo(() => {
      return currentEditing == null
        ? -1
        : list.findIndex(i => {
            return i.uuid === currentEditing.uuid;
          });
    }, [list, currentEditing]);

    const basePath = idx !== -1 ? `${path}[${idx}]` : '';
    const finalVisible = !!(visible && basePath);
    const handleVisibleChange = (v: boolean) => {
      setVisible(v);

      if (!v) {
        onHide?.();
      }
    };

    useImperativeHandle(
      ref,
      () => {
        return {
          hide() {
            setVisible(false);
          },
          show(item) {
            setCurrentEditing(item);
            setVisible(true);
          },
        };
      },
      []
    );

    useEffect(() => {
      if (currentEditing) {
        setEntering(true);
        let timer: any = setTimeout(() => {
          timer = undefined;
          setEntering(false);
        }, 400);

        return () => {
          if (timer != null) {
            clearTimeout(timer);
          }
        };
      }
    }, [currentEditing]);

    return (
      <EditorFormPortal
        className={classNames('vd-member-editor', s.root, { entering })}
        title={title ?? '编辑'}
        value={finalVisible}
        onChange={handleVisibleChange}
      >
        {typeof children === 'function' ? children(basePath, currentEditing) : children}
      </EditorFormPortal>
    );
  })
);
