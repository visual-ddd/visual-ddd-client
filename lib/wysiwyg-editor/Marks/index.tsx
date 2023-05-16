import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnderlineOutlined } from '@ant-design/icons';
import { Editor } from '@tiptap/core';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { memo, useCallback } from 'react';
import s from './index.module.scss';
import { useReadableKeyBinding } from '@/lib/hooks';
import { CodeIcon } from '../Toolbar/CodeIcon';

const Item = memo(
  (props: {
    Icon: React.ComponentType;
    tooltip: React.ReactNode;
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
  }) => {
    const { Icon, tooltip, active, disabled, onClick } = props;
    const handleClick = () => {
      if (disabled) {
        return;
      }

      onClick();
    };
    return (
      <Tooltip title={tooltip}>
        <div className={classNames(s.item, { active, disabled })} onClick={handleClick}>
          <Icon />
        </div>
      </Tooltip>
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
    </div>
  );
};
