import { ChatWindow } from '@/lib/chat-bot';
import { FloatButton } from 'antd';
import { BotIcon } from './BotIcon';

export const BotButton = () => {
  return (
    <ChatWindow>
      <FloatButton icon={<BotIcon />} type="primary"></FloatButton>
    </ChatWindow>
  );
};
