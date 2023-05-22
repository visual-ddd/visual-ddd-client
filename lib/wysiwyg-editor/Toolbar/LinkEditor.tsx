import { Editor, posToDOMRect, isTextSelection } from '@tiptap/core';
import { Button, Input, InputRef, Popover, Space } from 'antd';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';

import { CustomKeyboardBinding } from '../CustomKeyboardBinding';

import s from './LinkEditor.module.scss';

export interface LinkEditorProps {
  keyboardBinding: CustomKeyboardBinding;
  editor: Editor;
  children?: React.ReactNode;
}

const LinkEditorContent = observer(function LinkEditorContent(props: LinkEditorProps) {
  const { editor, keyboardBinding } = props;
  const inputRef = useRef<InputRef>(null);
  const [value, setValue] = useState(() => {
    return editor.getAttributes('link').href || '';
  });

  const handleSave = () => {
    keyboardBinding.toggleLinkSetter();
    editor.chain().focus().setLink({ href: value, target: '_blank' }).run();
  };

  const handleDelete = () => {
    keyboardBinding.toggleLinkSetter();
    editor.chain().focus().unsetLink().run();
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      keyboardBinding.toggleLinkSetter();
      editor.chain().focus().run();
    }
  };

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  return (
    <div className={s.root}>
      <Input
        className={s.input}
        value={value}
        placeholder="输入链接"
        ref={inputRef}
        onChange={e => {
          setValue(e.target.value);
        }}
        onKeyUp={handleKeyUp}
        autoFocus
      />
      <Space className={s.action}>
        <Button danger type="link" onClick={handleDelete}>
          删除
        </Button>
        <Button type="primary" onClick={handleSave}>
          保存
        </Button>
      </Space>
    </div>
  );
});

/**
 * 链接编辑器
 */
export const LinkEditor = observer(function LinkEditor(props: LinkEditorProps) {
  const { keyboardBinding, editor, children } = props;
  const [position, setPosition] = useState<{ [key: string]: number | string }>();

  useEffect(() => {
    if (!keyboardBinding.linkSetterVisible) return;

    const {
      state: { selection },
    } = editor;
    if (!isTextSelection(selection)) {
      return;
    }

    const { ranges } = selection;
    const from = Math.min(...ranges.map(range => range.$from.pos));
    const to = Math.max(...ranges.map(range => range.$to.pos));
    const rect = posToDOMRect(editor.view, from, to);

    const windowHeight = window.innerHeight;
    const top = rect.top + rect.height;

    if (top > windowHeight - 150) {
      setPosition(undefined);
    } else {
      setPosition({
        left: rect.left,
        top,
      });
    }
  }, [keyboardBinding.linkSetterVisible, editor]);

  useEffect(() => {
    if (!keyboardBinding.linkSetterVisible) return;

    const handleFocus = () => {
      keyboardBinding.closeLinkSetter();
    };

    editor.on('focus', handleFocus);

    return () => {
      editor.off('focus', handleFocus);
    };
  }, [editor, keyboardBinding, keyboardBinding.linkSetterVisible]);

  return (
    <Popover
      title="设置链接"
      content={<LinkEditorContent editor={editor} keyboardBinding={keyboardBinding}></LinkEditorContent>}
      open={keyboardBinding.linkSetterVisible}
      onOpenChange={v => {
        if (v) {
          keyboardBinding.showLinkSetter();
        } else {
          keyboardBinding.closeLinkSetter();
        }
      }}
      trigger={'click'}
      destroyTooltipOnHide
      overlayStyle={{ ...position }}
      arrow={false}
    >
      {children}
    </Popover>
  );
});
