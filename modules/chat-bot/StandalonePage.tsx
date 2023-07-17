/**
 * 独立页面
 */
import { ChatPage, registerMessageErrorHandler } from '@/lib/chat-bot';
import { isResponseError } from '@/modules/backend-client';
import { RequestControlErrorCode } from '@/modules/ai/shared';
import './extensions';

import { UserCard } from './UserCard';
import { useEffect } from 'react';
import { Modal, message } from 'antd';
import { UpgradeModal, useUpgradeModal } from '@/modules/plan/shared';

export function Chat(props: { models?: string[] }) {
  const upgradeModalRef = useUpgradeModal();

  const openUpgradeModalIfNeed = (msg: string) => {
    Modal.error({
      title: '请求失败',
      content: (
        <div>
          <p>{msg}</p>
        </div>
      ),
      okText: '升级套餐',
      cancelText: '取消',
      closable: true,
      onOk() {
        upgradeModalRef.current?.open();
      },
      centered: true,
    });
  };

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
            openUpgradeModalIfNeed('当前调用额度已超套餐上限');
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

  return (
    <>
      <UpgradeModal ref={upgradeModalRef} />
      <ChatPage sidebarFooter={<UserCard />} models={props.models} />
    </>
  );
}

export { Chat as default };
