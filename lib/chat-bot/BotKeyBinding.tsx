import { KeyboardBinding } from '@/lib/utils';
import type { BotModel } from './BotModel';
import MouseTrap from 'mousetrap';

export class BotKeyBinding extends KeyboardBinding {
  bot: BotModel;

  constructor(inject: { bot: BotModel }) {
    super();
    this.bot = inject.bot;

    this.initial();
  }

  private initial() {
    this.bindKey({
      name: 'show',
      title: '打开聊天窗',
      key: {
        macos: 'command+shift+i',
        other: 'ctrl+shift+i',
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
