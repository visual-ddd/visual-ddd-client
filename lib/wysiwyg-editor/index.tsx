import { EditorContent, useEditor } from '@tiptap/react';
import { Doc as YDoc } from 'yjs';

import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import Underline from '@tiptap/extension-underline';
import classNames from 'classnames';

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

  // TODO: 光标展示
  // https://tiptap.dev/guide/collaborative-editing
}

export const WYSIWYGEditor = (props: WYSIWYGEditorProps) => {
  const { doc, field } = props;
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 使用 yjs
        history: false,
      }),
      Collaboration.configure({
        document: doc,
        field,
      }),
      Underline,
    ],
  });

  return (
    <div className={classNames('vd-wd', s.root)}>
      <WYSIWYGEditorToolbar className={classNames('vd-wd__toolbar', s.toolbar)} editor={editor} />
      <EditorContent className={classNames('vd-wd__content', s.content)} editor={editor}></EditorContent>
    </div>
  );
};

export default WYSIWYGEditor;
