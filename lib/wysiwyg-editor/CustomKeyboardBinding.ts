import { KeyboardBinding } from '@/lib/utils';
import { Editor } from '@tiptap/react';
import { makeObservable, observable } from 'mobx';
import MouseTrap from 'mousetrap';
import { makeAutoBindThis, mutation } from '@/lib/store';

export class CustomKeyboardBinding extends KeyboardBinding {
  protected editor?: Editor;

  /**
   * 链接设置窗口是否开启
   */
  @observable
  linkSetterVisible = false;

  /**
   * 图片设置窗口是否开启
   */
  @observable
  imageSetterVisible = false;

  constructor() {
    super();

    makeObservable(this);
    makeAutoBindThis(this);
  }

  bindEditor(editor: Editor, container: HTMLDivElement) {
    this.editor = editor;
    this.initial(container);
  }

  @mutation('TOGGLE_LINK_SETTER', false)
  toggleLinkSetter() {
    if (!this.linkSetterVisible) {
      this.showLinkSetter();
    } else {
      this.showLinkSetter();
    }
  }

  @mutation('CLOSE_LINK_SETTER', false)
  closeLinkSetter() {
    this.linkSetterVisible = false;
  }

  @mutation('SHOW_LINK_SETTER', false)
  showLinkSetter() {
    if (!this.canLink()) {
      return;
    }
    this.linkSetterVisible = true;
  }

  @mutation('TOGGLE_IMAGE_SETTER', false)
  toggleImageSetter() {
    this.imageSetterVisible = !this.imageSetterVisible;
  }

  private canLink() {
    return this.editor?.can().setLink({ href: 'https://www.example.com' });
  }

  private initial(container: HTMLDivElement) {
    this.bindKey({
      name: 'link',
      title: '链接',
      description: '设置链接',
      key: {
        macos: 'command+k',
        other: 'ctrl+k',
      },
      handler: () => {
        this.toggleLinkSetter();
      },
    }).bindKey({
      name: 'image',
      title: '图片',
      description: '插入图片',
      key: {
        macos: 'command+g',
        other: 'ctrl+g',
      },
      handler: () => {
        this.toggleImageSetter();
      },
    });

    // 绑定
    const mouseTrap = new MouseTrap(container);
    this.bindRegistry({
      bind(key, handler) {
        mouseTrap.bind(key, handler);
      },
      /**
       * 只有当编辑器激活时才启用
       * @returns
       */
      guard: () => {
        return !!this.editor?.isFocused;
      },
      unbind(key) {
        mouseTrap.unbind(key);
      },
      unbindAll() {
        mouseTrap.reset();
      },
    });
  }
}
