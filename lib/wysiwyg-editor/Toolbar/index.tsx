import { Editor } from '@tiptap/core';
import { Toolbar } from '@antv/x6-react-components';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  UndoOutlined,
  RedoOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  LinkOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useReadableKeyBinding } from '@/lib/hooks';

import { CustomKeyboardBinding } from '../CustomKeyboardBinding';

import { CodeIcon } from './CodeIcon';
import { JustifyIcon } from './JustifyIcon';
import { LinkEditor } from './LinkEditor';
import { ImageEditor } from './ImageEditor';

export interface WYSIWYGEditorToolbarProps {
  editor: Editor | null;
  className?: string;
  keyboardBinding: CustomKeyboardBinding;
  style?: React.CSSProperties;
}

const Group = Toolbar.Group;
const Item = Toolbar.Item;

// 这里不要使用 memo 和 observer，否则会导致 toolbar 无法更新
export const WYSIWYGEditorToolbar = function WYSIWYGEditorToolbar(props: WYSIWYGEditorToolbarProps) {
  const { editor, keyboardBinding, ...other } = props;
  // tiptap 内置快捷键 https://tiptap.dev/api/keyboard-shortcuts
  const getReadableKeyBinding = useReadableKeyBinding();

  if (editor == null) {
    return null;
  }

  return (
    <Toolbar {...other}>
      <Group>
        <Item
          name="undo"
          icon={<UndoOutlined />}
          active={editor.isActive('undo')}
          tooltip={`撤销 (${getReadableKeyBinding({ macos: 'command+z', other: 'ctrl+z' })})`}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        ></Item>
        <Item
          name="redo"
          icon={<RedoOutlined />}
          active={editor.isActive('redo')}
          tooltip={`重做 (${getReadableKeyBinding({ macos: 'command+shift+z', other: 'ctrl+shift+z' })})`}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        ></Item>
      </Group>
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
      <Group>
        <Item
          name="left"
          icon={<AlignLeftOutlined />}
          active={editor.isActive({ textAlign: 'left' })}
          tooltip={`左对齐 (${getReadableKeyBinding({ macos: 'command+shift+L', other: 'ctrl+shift+L' })})`}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          disabled={!editor.can().chain().focus().setTextAlign('left').run()}
        ></Item>
        <Item
          name="center"
          icon={<AlignCenterOutlined />}
          active={editor.isActive({ textAlign: 'center' })}
          tooltip={`居中对齐 (${getReadableKeyBinding({ macos: 'command+shift+E', other: 'ctrl+shift+E' })})`}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          disabled={!editor.can().chain().focus().setTextAlign('center').run()}
        ></Item>
        <Item
          name="right"
          icon={<AlignRightOutlined />}
          active={editor.isActive({ textAlign: 'right' })}
          tooltip={`右对齐 (${getReadableKeyBinding({ macos: 'command+shift+R', other: 'ctrl+shift+R' })})`}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          disabled={!editor.can().chain().focus().setTextAlign('right').run()}
        ></Item>
        <Item
          name="justify"
          icon={<JustifyIcon />}
          active={editor.isActive({ textAlign: 'justify' })}
          tooltip={`两端对齐 (${getReadableKeyBinding({ macos: 'command+shift+J', other: 'ctrl+shift+J' })})`}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          disabled={!editor.can().chain().focus().setTextAlign('justify').run()}
        ></Item>
      </Group>
      <Group>
        <Item
          name="bulletList"
          icon={<UnorderedListOutlined />}
          active={editor.isActive('bulletList')}
          tooltip={`无序列表 (${getReadableKeyBinding({ macos: 'command+shift+8', other: 'ctrl+shift+8' })})`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
        ></Item>
        <Item
          name="orderedList"
          icon={<OrderedListOutlined />}
          active={editor.isActive('orderedList')}
          tooltip={`有序列表 (${getReadableKeyBinding({ macos: 'command+shift+7', other: 'ctrl+shift+7' })})`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        ></Item>
        <Group>
          <LinkEditor keyboardBinding={keyboardBinding} editor={editor}>
            <Item
              name="link"
              icon={<LinkOutlined />}
              active={editor.isActive('link')}
              tooltip={`链接 (${getReadableKeyBinding({ macos: 'command+k', other: 'ctrl+k' })})`}
              tooltipProps={{ placement: 'right' }}
            ></Item>
          </LinkEditor>
          <ImageEditor keyboardBinding={keyboardBinding} editor={editor}>
            <Item
              name="image"
              icon={<PictureOutlined />}
              active={editor.isActive('image')}
              tooltip="插入图片"
              tooltipProps={{ placement: 'right' }}
            ></Item>
          </ImageEditor>
        </Group>
      </Group>
    </Toolbar>
  );
};
