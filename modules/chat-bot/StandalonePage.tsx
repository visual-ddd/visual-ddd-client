/**
 * 独立页面
 */
import './extensions';

import { ChatPage } from '@/lib/chat-bot';

import { UserCard } from './UserCard';

export function Chat() {
  return <ChatPage sidebarFooter={<UserCard />} />;
}

export { Chat as default };
