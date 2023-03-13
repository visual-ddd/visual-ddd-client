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
    this.linkSetterVisible = !this.linkSetterVisible;
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
