import { UploadOutlined } from '@ant-design/icons';
import { Editor } from '@tiptap/core';
import { Button, Input, InputRef, message, Popover, Tabs, Upload } from 'antd';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import { CustomKeyboardBinding } from '../CustomKeyboardBinding';
import { isValidImage, transformFileToBase64 } from '../utils';

import s from './ImageEditor.module.scss';

export interface ImageEditorProps {
  keyboardBinding: CustomKeyboardBinding;
  editor: Editor;
  children?: React.ReactNode;
}

const ImageEditorContent = observer(function ImageEditorContent(props: ImageEditorProps) {
  const { editor } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const [externalUrl, setExternalUrl] = useState(() => {
    return editor.getAttributes('image')?.src ?? '';
  });
  const [activeTab, setActiveTab] = useState(() => {
    if (externalUrl) {
      return 'link';
    }
    return 'upload';
  });
  const setImage = (url: string) => {
    props.keyboardBinding.toggleImageSetter();
    props.editor.chain().focus().setImage({ src: url }).run();
  };

  const handleInsertExternalImage = () => {
    if (externalUrl.trim()) {
      props.keyboardBinding.toggleImageSetter();
      props.editor.chain().focus().setImage({ src: externalUrl }).run();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      props.keyboardBinding.toggleImageSetter();
      props.editor.chain().focus().run();
    }
  };

  useEffect(() => {
    if (activeTab === 'link') {
      inputRef.current?.select();
    } else {
      containerRef.current?.focus();
    }
  }, []);

  return (
    <div className={s.root} onKeyDown={handleKeyDown} tabIndex={0} ref={containerRef}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        items={[
          {
            key: 'upload',
            label: '上传',
            children: (
              <div className={s.upload}>
                <Upload
                  maxCount={1}
                  accept="image/*"
                  beforeUpload={async file => {
                    if (!isValidImage(file)) {
                      message.error('请上传图片，且文件大小不能超过5M');
                      return false;
                    }

                    const url = await transformFileToBase64(file);
                    setImage(url);

                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} type="primary">
                    上传图片
                  </Button>
                </Upload>
              </div>
            ),
          },
          {
            key: 'link',
            label: '链接',
            children: (
              <div className={s.external}>
                <Input
                  placeholder="输入图片链接到这里"
                  value={externalUrl}
                  autoFocus
                  ref={inputRef}
                  onChange={e => {
                    setExternalUrl(e.target.value);
                  }}
                />
                <Button type="primary" disabled={!externalUrl.trim()} onClick={handleInsertExternalImage}>
                  插入
                </Button>
              </div>
            ),
          },
        ]}
      ></Tabs>
    </div>
  );
});

export const ImageEditor = observer(function ImageEditor(props: ImageEditorProps) {
  const { children, editor, keyboardBinding } = props;
  return (
    <Popover
      title="插入图片"
      trigger="click"
      open={keyboardBinding.imageSetterVisible}
      onOpenChange={keyboardBinding.toggleImageSetter}
      destroyTooltipOnHide
      content={<ImageEditorContent editor={editor} keyboardBinding={keyboardBinding} />}
    >
      {children}
    </Popover>
  );
});
