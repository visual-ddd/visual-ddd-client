import { EditorContent, useEditor } from '@tiptap/react';
import { Doc as YDoc } from 'yjs';
import { Awareness } from 'y-protocols/awareness';

import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Underline from '@tiptap/extension-underline';
import classNames from 'classnames';
import { IUser } from '@/lib/core';

import { getMappedColor, ignoreFalse } from '@/lib/utils';

import s from './index.module.scss';
import { WYSIWYGEditorToolbar } from './Toolbar';

export interface WYSIWYGEditorProps {
  /**
   * yjs 文档
   */
  doc: YDoc;

  /**
   * yjs 文档字段
   */
  field: string;

  /**
   * 只读模式
   */
  readonly?: boolean;

  /**
   * 多人协作 光标展示
   * https://tiptap.dev/guide/collaborative-editing
   */
  awareness?: Awareness;

  /**
   * 如果开启了多人协作，需要传递该属性
   */
  user?: IUser;
}

export const WYSIWYGEditor = (props: WYSIWYGEditorProps) => {
  const { doc, field, readonly, awareness, user } = props;

  const editor = useEditor({
    editable: !readonly,
    extensions: [
      StarterKit.configure({
        // 使用 yjs
        history: false,
      }),
      Collaboration.configure({
        document: doc,
        field,
      }),

      !!awareness &&
        !!user &&
        CollaborationCursor.configure({
          provider: Object.create({ awareness }),
          user: { ...user, color: getMappedColor(user.name) },
          render(member) {
            const cursor = document.createElement('span');

            cursor.classList.add('collaboration-cursor__caret');
            cursor.setAttribute('style', `border-color: ${member.color}`);

            const label = document.createElement('div');

            label.classList.add('collaboration-cursor__label');
            label.setAttribute('style', `background-color: ${member.color}`);

            if (user.avatar) {
              const avatar = document.createElement('span');
              avatar.classList.add('collaboration-cursor__avatar');
              avatar.style.backgroundImage = `url(${user.avatar})`;

              label.appendChild(avatar);
            }

            label.appendChild(document.createTextNode(member.name));

            cursor.insertBefore(label, null);

            return cursor;
          },
        }),
      Underline,
    ].filter(ignoreFalse),
  });

  return (
    <div className={classNames('vd-wd', s.root)}>
      <WYSIWYGEditorToolbar className={classNames('vd-wd__toolbar', s.toolbar)} editor={editor} />
      <EditorContent className={classNames('vd-wd__content', s.content)} editor={editor}></EditorContent>
    </div>
  );
};

export default WYSIWYGEditor;
