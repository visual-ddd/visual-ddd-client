import { XmlFragment } from 'yjs';
import { EditorContent, useEditor, ReactNodeViewRenderer } from '@tiptap/react';
import { lowlight } from 'lowlight';
import classNames from 'classnames';

import Collaboration from '@tiptap/extension-collaboration';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block-lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';

import { CodeBlockComponent } from './CodeBlockComponent';

import s from './common.module.scss';
import { ReactBlock } from './ReactBlock';
import './CustomBlock';
import { DBlock } from './DBlock';
import { Document } from './Document';

export interface StaticEditorProps {
  content: XmlFragment;

  placeholder?: string;

  className?: string;

  style?: React.CSSProperties;
}

lowlight.registerLanguage('html', html);
lowlight.registerLanguage('css', css);
lowlight.registerLanguage('js', js);
lowlight.registerLanguage('ts', ts);

export const StaticEditor = (props: StaticEditorProps) => {
  const { content, className, ...other } = props;

  const editor = useEditor({
    editable: false,
    extensions: [
      ReactBlock,
      DBlock,
      StarterKit.configure({
        // 使用 yjs
        history: false,
        codeBlock: false,
        document: false,
      }),
      Document,
      Collaboration.configure({
        fragment: content,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }) as any,

      Link.configure({}),

      Image.configure({}),

      CodeBlock.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
      }),
    ],
  });

  return <EditorContent editor={editor} className={classNames(className, s.root)} {...other}></EditorContent>;
};

export default StaticEditor;
