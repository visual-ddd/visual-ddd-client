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
          <History
            intro={
              <>
                <p>
                  <code>Visual DDD ChatBot</code> 是一个 AI 聊天机器人，你可以问它任何关于 DDD 的问题。基本用法如下：{' '}
                </p>
                <ol>
                  <li>你可以通过侧边栏，为不同的主题新建不同的会话</li>
                  <li>你可以点击上面修改主题描述，定义聊天的规则</li>
                  <li>
                    我也支持一些特定的指令，你可以输入 <code>#</code> 选择并激活特定指令
                  </li>
                  <li> 随便聊聊吧 </li>
                </ol>
                <p>
                  目前，
                  <b>
                    ChatBot 还是一个实验性的功能, 如果你遇到任何问题，可以 <code>#BUG</code> 给我们反馈问题, 谢谢
                  </b>
                  。
                </p>
              </>
            }
          />
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
      placeholder: '输入主题，比如"请润色我说的每一句话"',
      maxLength: 1000,
    });

    if (system != null) {
      store.currentActiveSession?.setSystem(system);
    }
  };

  return (
    <div className={s.root}>
      <header className={s.header}>
        <SidebarIcon className={s.fold} onClick={onToggleSidebar} id="chat-page-sidebar-folder" />
        <aside className={s.headerBody}>
          <div className={s.title}>{store.currentActiveSession?.name}</div>
          <div className={classNames(s.system, 'u-line-clamp-4')} id="chat-page-change-system">
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
