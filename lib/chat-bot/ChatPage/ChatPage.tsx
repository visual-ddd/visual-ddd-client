import { observer } from 'mobx-react';
import s from './ChatPage.module.scss';
import { Sidebar } from './Sidebar';
import { Content } from './Content';
import { useEffect, useMemo } from 'react';
import { tryDispose } from '@/lib/utils';
import { BotSessionStoreProvider } from '../BotSessionStoreContext';
import { SplitBox } from '@antv/x6-react-components';
import { BotPageModel } from '../BotPageModel';

export interface ChatPageProps {}

/**
 * 独立聊天页面
 */
export const ChatPage = observer(function ChatPage(props: ChatPageProps) {
  const pageModel = useMemo(() => {
    return new BotPageModel();
  }, []);

  useEffect(() => {
    return () => {
      return tryDispose(pageModel);
    };
  }, [pageModel]);

  return (
    <BotSessionStoreProvider store={pageModel.store}>
      <div className={s.root}>
        <SplitBox
          split="vertical"
          size={pageModel.sidebarFolded ? 0 : pageModel.size}
          resizable={!pageModel.sidebarFolded}
          onResizeEnd={pageModel.setSize}
          maxSize={400}
          minSize={180}
        >
          <Sidebar />
          <Content onToggleSidebar={pageModel.toggleSidebarFolded} />
        </SplitBox>
      </div>
    </BotSessionStoreProvider>
  );
});
