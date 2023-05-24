import { isTextSelection } from '@tiptap/core';
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from '@ant-design/icons';
import { Editor } from '@tiptap/core';
import classNames from 'classnames';
import { memo, useCallback } from 'react';
import { useReadableKeyBinding } from '@/lib/hooks';
import { BubbleMenu, BubbleMenuProps } from '@tiptap/react';

import { CodeIcon } from '../Toolbar/CodeIcon';
import { JustifyIcon } from '../Toolbar/JustifyIcon';
import s from './index.module.scss';

const Item = memo(
  (props: { Icon: React.ComponentType; tooltip: string; active: boolean; disabled?: boolean; onClick: () => void }) => {
    const { Icon, tooltip, active, disabled, onClick } = props;
    const handleClick = () => {
      if (disabled) {
        return;
      }

      onClick();
    };
    return (
      <div className={classNames(s.item, { active, disabled })} onClick={handleClick} title={tooltip}>
        <Icon />
      </div>
    );
  }
);

Item.displayName = 'Item';

export interface MarksProps {
  editor: Editor;
}

export const Marks = (props: MarksProps) => {
  const { editor } = props;

  // tiptap 内置快捷键 https://tiptap.dev/api/keyboard-shortcuts
  const getReadableKeyBinding = useReadableKeyBinding();
  const handleBold = useCallback(() => {
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const handleItalic = useCallback(() => {
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  const handleUnderline = useCallback(() => {
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  const handleStrike = useCallback(() => {
    editor.chain().focus().toggleStrike().run();
  }, [editor]);

  const handleCode = useCallback(() => {
    editor.chain().focus().toggleCode().run();
  }, [editor]);

  const handleLeftAlign = useCallback(() => editor.chain().focus().setTextAlign('left').run(), [editor]);
  const handleCenterAlign = useCallback(() => editor.chain().focus().setTextAlign('center').run(), [editor]);
  const handleRightAlign = useCallback(() => editor.chain().focus().setTextAlign('right').run(), [editor]);
  const handleJustifyAlign = useCallback(() => editor.chain().focus().setTextAlign('justify').run(), [editor]);

  return (
    <div className={s.root}>
      <div className={s.group}>
        <Item
          Icon={BoldOutlined}
          active={editor.isActive('bold')}
          tooltip={`加粗 ${getReadableKeyBinding({ macos: 'command+b', other: 'ctrl+b' })}`}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          onClick={handleBold}
        ></Item>
        <Item
          Icon={ItalicOutlined}
          active={editor.isActive('italic')}
          tooltip={`斜体 ${getReadableKeyBinding({ macos: 'command+i', other: 'ctrl+i' })}`}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          onClick={handleItalic}
        ></Item>
        <Item
          Icon={UnderlineOutlined}
          active={editor.isActive('underline')}
          tooltip={`下划线 ${getReadableKeyBinding({ macos: 'command+u', other: 'ctrl+u' })}`}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          onClick={handleUnderline}
        />
        <Item
          Icon={StrikethroughOutlined}
          active={editor.isActive('strike')}
          tooltip={`删除线 ${getReadableKeyBinding({ macos: 'command+shift+x', other: 'ctrl+shift+x' })}`}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          onClick={handleStrike}
        ></Item>
        <Item
          Icon={CodeIcon}
          active={editor.isActive('code')}
          tooltip={`代码 ${getReadableKeyBinding({ macos: 'command+e', other: 'ctrl+e' })}`}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          onClick={handleCode}
        ></Item>
      </div>
      <div className={s.group}>
        <Item
          Icon={AlignLeftOutlined}
          active={editor.isActive({ textAlign: 'left' })}
          tooltip={`左对齐 (${getReadableKeyBinding({ macos: 'command+shift+L', other: 'ctrl+shift+L' })})`}
          onClick={handleLeftAlign}
          disabled={!editor.can().chain().focus().setTextAlign('left').run()}
        ></Item>
        <Item
          Icon={AlignCenterOutlined}
          active={editor.isActive({ textAlign: 'center' })}
          tooltip={`居中对齐 (${getReadableKeyBinding({ macos: 'command+shift+E', other: 'ctrl+shift+E' })})`}
          onClick={handleCenterAlign}
          disabled={!editor.can().chain().focus().setTextAlign('center').run()}
        ></Item>
        <Item
          Icon={AlignRightOutlined}
          active={editor.isActive({ textAlign: 'right' })}
          tooltip={`右对齐 (${getReadableKeyBinding({ macos: 'command+shift+R', other: 'ctrl+shift+R' })})`}
          onClick={handleRightAlign}
          disabled={!editor.can().chain().focus().setTextAlign('right').run()}
        ></Item>
        <Item
          Icon={JustifyIcon}
          active={editor.isActive({ textAlign: 'justify' })}
          tooltip={`两端对齐 (${getReadableKeyBinding({ macos: 'command+shift+J', other: 'ctrl+shift+J' })})`}
          onClick={handleJustifyAlign}
          disabled={!editor.can().chain().focus().setTextAlign('justify').run()}
        ></Item>
      </div>
    </div>
  );
};

export interface BubbleMarksProps {
  editor?: Editor | null;
}

const shouldShow: BubbleMenuProps['shouldShow'] = function ({ editor, view, state, from, to }) {
  const { doc, selection } = state;
  const { empty } = selection;

  const isTextSelected = isTextSelection(state.selection);
  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.
  const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelected;

  // When clicking on a element inside the bubble menu the editor "blur" event
  // is called and the bubble menu item is focussed. In this case we should
  // consider the menu as part of the editor and keep showing the menu
  // @ts-expect-error
  const isChildOfMenu = this.element.contains(document.activeElement);

  const hasEditorFocus = view.hasFocus() || isChildOfMenu;

  if (!hasEditorFocus || empty || isEmptyTextBlock || !editor.isEditable) {
    return false;
  }

  return isTextSelected;
};

export const BubbleMarks = (props: BubbleMarksProps) => {
  const { editor } = props;
  if (editor == null) {
    return null;
  }

  return (
    <BubbleMenu editor={editor} updateDelay={0} shouldShow={shouldShow}>
      <Marks editor={editor} />
    </BubbleMenu>
  );
};
