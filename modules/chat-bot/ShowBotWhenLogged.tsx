import { useSession } from '@/modules/session';
import { useResponsive } from 'ahooks';

import './extensions';
import { BotButton } from './BotButton';
import { useRouter } from 'next/router';
import { useChatSupported } from './hooks';

export const ShowBotWhenLogged = () => {
  const router = useRouter();
  const session = useSession({ immutable: false, shouldRedirect: false });
  const supported = useChatSupported();
  const responsive = useResponsive();

  if (!session.session || !supported || router.asPath === '/chat' || !responsive.sm) {
    return null;
  }

  return <BotButton />;
};

export default ShowBotWhenLogged;
