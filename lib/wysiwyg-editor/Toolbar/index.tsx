import { Editor } from '@tiptap/core';
import { Toolbar } from '@antv/x6-react-components';
import { BoldOutlined, ItalicOutlined, UnderlineOutlined, StrikethroughOutlined } from '@ant-design/icons';
import { useReadableKeyBinding } from '@/lib/hooks';
import { CodeIcon } from './CodeIcon';

export interface WYSIWYGEditorToolbarProps {
  editor: Editor | null;
  className?: string;
  style?: React.CSSProperties;
}

const Group = Toolbar.Group;
const Item = Toolbar.Item;

// 这里不要使用 memo，否则会导致 toolbar 无法更新
export const WYSIWYGEditorToolbar = function WYSIWYGEditorToolbar(props: WYSIWYGEditorToolbarProps) {
  const { editor, ...other } = props;
  // tiptap 内置快捷键 https://tiptap.dev/api/keyboard-shortcuts
  const getReadableKeyBinding = useReadableKeyBinding();

  if (editor == null) {
    return null;
  }

  return (
    <Toolbar {...other}>
      <Group>
        <Item
          name="bold"
          icon={<BoldOutlined />}
          active={editor.isActive('bold')}
          tooltip={`加粗 (${getReadableKeyBinding({ macos: 'command+b', other: 'ctrl+b' })})`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        ></Item>
        <Item
          name="italic"
          icon={<ItalicOutlined />}
          active={editor.isActive('italic')}
          tooltip={`斜体 (${getReadableKeyBinding({ macos: 'command+i', other: 'ctrl+i' })})`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        ></Item>
        <Item
          name="underline"
          icon={<UnderlineOutlined />}
          active={editor.isActive('underline')}
          tooltip={`下划线 (${getReadableKeyBinding({ macos: 'command+u', other: 'ctrl+u' })})`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
        ></Item>
        <Item
          name="strike"
          icon={<StrikethroughOutlined />}
          active={editor.isActive('strike')}
          tooltip={`删除线 (${getReadableKeyBinding({ macos: 'command+shift+x', other: 'ctrl+shift+x' })})`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
        ></Item>
        <Item
          name="code"
          icon={<CodeIcon />}
          active={editor.isActive('code')}
          tooltip={`代码 (${getReadableKeyBinding({ macos: 'command+e', other: 'ctrl+e' })})`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
        ></Item>
      </Group>
    </Toolbar>
  );
};
