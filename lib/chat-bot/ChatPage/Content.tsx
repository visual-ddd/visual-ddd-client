import { observer } from 'mobx-react';

import s from './Content.module.scss';
import { useBotSessionStoreContext } from '../BotSessionStoreContext';
import classNames from 'classnames';
import { BotSession } from '../BotSession';
import { BotProvider } from '../BotContext';
import { History } from '../ChatWindow/History';
import { Prompt } from '../ChatWindow/Prompt';
import { SidebarIcon } from './SidebarIcon';
import { EditOutlined } from '@ant-design/icons';
import { usePrompt } from '@/lib/components/Prompt';

export interface ContentProps {
  onToggleSidebar?: () => void;
}

const Item = observer(function Item(props: { item: BotSession; active: boolean }) {
  const { item, active } = props;

  return (
    <BotProvider bot={item.model!}>
      <div className={classNames(s.session, { active })}>
        <div className={s.history}>
          <History />
        </div>
        <div className={s.prompt}>
          <Prompt />
        </div>
      </div>
    </BotProvider>
  );
});

export const Content = observer(function Content(props: ContentProps) {
  const { onToggleSidebar } = props;
  const store = useBotSessionStoreContext();
  const [showPrompt, promptHolder] = usePrompt();

  const handleEditSystem = async () => {
    const system = await showPrompt({
      title: '修改主题',
      value: store.currentActiveSession?.system || '',
      placeholder: '输入主题，比如请润色我说的每一句话',
    });

    if (system?.trim()) {
      store.currentActiveSession?.setSystem(system);
    }
  };

  return (
    <div className={s.root}>
      <header className={s.header}>
        <SidebarIcon className={s.fold} onClick={onToggleSidebar} />
        <aside className={s.headerBody}>
          <div className={s.title}>{store.currentActiveSession?.name}</div>
          <div className={classNames(s.system, 'u-line-clamp-3')}>
            {store.currentActiveSession?.system || '随便聊聊'}
            <span className={classNames('u-link', s.editSystem)} onClick={handleEditSystem}>
              <EditOutlined /> 修改主题
            </span>
          </div>
        </aside>
      </header>
      {promptHolder}
      <main className={s.sessions}>
        {store.sessions.map(i => {
          if (!i.model) {
            return null;
          }

          return <Item key={i.uuid} item={i} active={i.uuid === store.active} />;
        })}
      </main>
    </div>
  );
});
