import { KeyboardBinding } from '@/lib/utils';
import type { BotWindowModel } from './BotWindowModel';
import MouseTrap from 'mousetrap';

export class BotWindowKeyBinding extends KeyboardBinding {
  bot: BotWindowModel;

  constructor(inject: { bot: BotWindowModel }) {
    super();
    this.bot = inject.bot;

    this.initial();
  }

  private initial() {
    this.bindKey({
      name: 'show',
      title: '打开聊天窗',
      key: {
        macos: 'command+shift+u',
        other: 'ctrl+shift+u',
      },
      handler: () => {
        this.bot.show();
      },
    });

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
