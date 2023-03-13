import { Editor } from '@tiptap/core';
import { message } from 'antd';
import { MAX_IMAGE_SIZE } from './constants';
import { isValidImage, transformFileToBase64 } from './utils';

export class FileHandler {
  private editor?: Editor;

  bindEditor(editor: Editor) {
    this.editor = editor;
  }

  async handleFiles(files: File[]) {
    const validFiles = files.filter(isValidImage);

    if (validFiles.length !== files.length) {
      message.warning(`仅支持图片，且图片大小不能超过${MAX_IMAGE_SIZE / 1024 / 1024}M`);
    }

    const transformed = await Promise.all(files.map(transformFileToBase64));

    // 插入图片
    for (const file of transformed) {
      this.editor?.chain().focus().setImage({ src: file }).run();
    }
  }
}
