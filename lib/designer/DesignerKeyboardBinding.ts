import { KeyboardBinding } from '@/lib/utils';
import MouseTrap from 'mousetrap';
import { IDesigner } from './IDesigner';

/**
 * 设计器键盘映射
 */
export class DesignerKeyboardBinding extends KeyboardBinding {
  designer: IDesigner;

  constructor(inject: { model: IDesigner }) {
    super();
    this.designer = inject.model;

    this.initial();
  }

  initial() {
    this.bindKey({
      name: 'save',
      title: '保存',
      description: '验证并保存',
      key: {
        macos: 'command+s',
        other: 'ctrl+s',
      },
      handler: () => {
        this.designer.save();
      },
    });

    // 绑定
    const mouseTrap = new MouseTrap();
    this.bindRegistry({
      bind(key, handler) {
        mouseTrap.bind(key, handler);
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
