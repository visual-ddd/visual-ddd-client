/**
 * 独立页面
 */
import { ChatPage, registerMessageErrorHandler } from '@/lib/chat-bot';
import { isResponseError } from '@/modules/backend-client';
import { RequestControlErrorCode } from '@/modules/ai/shared';
import './extensions';

import { UserCard } from './UserCard';
import { useEffect } from 'react';
import { message } from 'antd';

export function Chat(props: { models?: string[] }) {
  useEffect(() => {
    return registerMessageErrorHandler(context => {
      const { error, responseMessageId, userMessageId, bot } = context;

      const removeMessage = () => {
        if (responseMessageId && userMessageId !== responseMessageId) {
          // 删除回复信息
          bot.removeMessage(responseMessageId);
        }

        if (userMessageId) {
          bot.putMessageBackToPrompt(userMessageId);
        }
      };

      if (isResponseError(error)) {
        switch (error.code) {
          case RequestControlErrorCode.PlanExceed:
          case RequestControlErrorCode.FeatureNotAllowed:
            // 展示 VIP 订阅界面
            removeMessage();
            message.error(error.message);
            return false;
          case RequestControlErrorCode.RateLimit:
            removeMessage();
            message.error(error.message);
            return false;
        }
      }

      return true;
    });
  }, []);

  return <ChatPage sidebarFooter={<UserCard />} models={props.models} />;
}

export { Chat as default };
