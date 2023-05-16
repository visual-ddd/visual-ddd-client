import { useEffect, useMemo, useRef } from 'react';
import { EditorContent, BubbleMenu, useEditor, ReactNodeViewRenderer } from '@tiptap/react';
import { Doc as YDoc } from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { lowlight } from 'lowlight';
import { xmlFragmentToJSON } from '@/lib/yjs-xml-fragment';

import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block-lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import classNames from 'classnames';
import { IUser } from '@/lib/core';
import { NoopArray } from '@wakeapp/utils';
import { getMappedColor, ignoreFalse, tryDispose } from '@/lib/utils';

import { WYSIWYGEditorToolbar } from './Toolbar';
import { CustomKeyboardBinding } from './CustomKeyboardBinding';
import { FileHandler } from './FileHandler';
import { CodeBlockComponent } from './CodeBlockComponent';
import { Commands } from './Suggestion';
import s from './index.module.scss';
import cs from './common.module.scss';
import { ReactBlock } from './ReactBlock';
import './CustomBlock';
import { Marks } from './Marks';

lowlight.registerLanguage('html', html);
lowlight.registerLanguage('css', css);
lowlight.registerLanguage('js', js);
lowlight.registerLanguage('ts', ts);

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

  placeholder?: string;

  className?: string;

  style?: React.CSSProperties;
}

export const WYSIWYGEditor = (props: WYSIWYGEditorProps) => {
  const { doc, field, readonly, awareness, user, placeholder, className, ...other } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    editable: !readonly,
    extensions: [
      // / 命令
      Commands,

      ReactBlock,

      StarterKit.configure({
        // 使用 yjs
        history: false,
        codeBlock: false,
      }),
      Collaboration.configure({
        document: doc,
        field,
      }),

      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }) as any,

      Link.configure({}),

      Image.configure({}),

      Placeholder.configure({
        includeChildren: true,
        placeholder:
          placeholder ??
          (({ node }) => {
            if (node.type.name === 'heading') {
              return `标题 ${node.attrs.level}`;
            }

            return '输入正文或 / 唤起更多';
          }),
      }),

      CodeBlock.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
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

  const keyboardBinding = useMemo(() => {
    return new CustomKeyboardBinding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, NoopArray);

  const fileHandler = useMemo(() => {
    return new FileHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, NoopArray);

  useEffect(() => {
    if (editor) {
      keyboardBinding.bindEditor(editor, containerRef.current!);

      return () => {
        tryDispose(keyboardBinding);
      };
    }
  }, [keyboardBinding, editor]);

  useEffect(() => {
    if (editor) {
      fileHandler.bindEditor(editor);
    }
  }, [fileHandler, editor]);

  useEffect(() => {
    // 方便调试
    // @ts-expect-error
    containerRef.current.__EDITOR__ = editor;
    // @ts-expect-error
    containerRef.current.__TO_JSON__ = () => {
      return xmlFragmentToJSON(doc.getXmlFragment(field));
    };
  }, [editor, doc, field]);

  // 处理粘贴事件
  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = e => {
    if (e.clipboardData.files.length) {
      e.preventDefault();
      e.stopPropagation();
      fileHandler?.handleFiles(Array.from(e.clipboardData.files));
    }
  };

  return (
    <div className={classNames('vd-wd', s.root, className, cs.root)} ref={containerRef} {...other}>
      {!readonly && (
        <WYSIWYGEditorToolbar
          className={classNames('vd-wd__toolbar', s.toolbar)}
          editor={editor}
          keyboardBinding={keyboardBinding}
        />
      )}

      <EditorContent
        onPasteCapture={handlePaste}
        className={classNames('vd-wd__content', s.content)}
        editor={editor}
      ></EditorContent>
      {!!editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <Marks editor={editor} />
        </BubbleMenu>
      )}
    </div>
  );
};

export default WYSIWYGEditor;
