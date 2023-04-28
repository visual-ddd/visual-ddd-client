import { observer } from 'mobx-react';
import { Tour, TourStepProps } from 'antd';
import { SplitBox } from '@antv/x6-react-components';
import { useEffect, useMemo, useState } from 'react';
import { tryDispose } from '@/lib/utils';
import { useResponsive } from 'ahooks';

import { BotSessionStoreProvider } from '../BotSessionStoreContext';
import { BotPageModel } from '../BotPageModel';
import { Content } from './Content';
import { Sidebar } from './Sidebar';
import s from './ChatPage.module.scss';

export interface ChatPageProps {}

const steps: TourStepProps[] = [
  {
    target: () => document.querySelector('#chat-page-add-session')!,
    title: '新建自定义会话',
    description: '你可以为不同的主题新建不同的会话, 互不干扰',
  },
  {
    target: () => document.querySelector('#chat-page-sidebar-folder')!,
    title: '折叠侧边栏',
    description: '切换侧边栏的折叠状态，以获得更多的空间； 其次，侧边栏也支持拖拽调整大小',
  },
  {
    target: () => document.querySelector('#chat-page-change-system')!,
    title: '修改主题',
    description: '点击修改主题描述，定义聊天的规则。',
  },
  {
    target: () => document.querySelector('#chat-bot-prompt')!,
    title: '开始聊天吧',
    description: '随便聊聊吧, 你可以输入 # 选择并激活特定指令。',
  },
];

/**
 * 独立聊天页面
 */
export const ChatPage = observer(function ChatPage(props: ChatPageProps) {
  const [showTour, setShowTour] = useState(false);
  const pageModel = useMemo(() => {
    return new BotPageModel();
  }, []);
  const responsive = useResponsive();
  const hideSidebar = !responsive.sm || (pageModel.store.sessions.length ? pageModel.sidebarFolded : false);

  useEffect(() => {
    return () => {
      return tryDispose(pageModel);
    };
  }, [pageModel]);

  useEffect(() => {
    if (window.innerWidth < 500) {
      return;
    }

    const shouldShowTour = localStorage.getItem('chat-page-tour');
    if (shouldShowTour == null) {
      requestAnimationFrame(() => {
        setShowTour(true);
      });
      localStorage.setItem('chat-page-tour', '1');
    }
  }, []);

  return (
    <BotSessionStoreProvider store={pageModel.store}>
      <div className={s.root}>
        <SplitBox
          split="vertical"
          size={hideSidebar ? 0 : pageModel.size}
          resizable={!hideSidebar}
          onResizeEnd={pageModel.setSize}
          maxSize={400}
          minSize={180}
        >
          <Sidebar />
          <Content onToggleSidebar={pageModel.toggleSidebarFolded} />
        </SplitBox>
      </div>
      <Tour steps={steps} open={showTour} onClose={() => setShowTour(false)} type="primary" />
    </BotSessionStoreProvider>
  );
});
