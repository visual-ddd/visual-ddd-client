import { useSession } from '@/modules/session';

import './extensions';
import { BotButton } from './BotButton';
import { useRouter } from 'next/router';

export const ShowBotWhenLogged = () => {
  const router = useRouter();
  const session = useSession({ immutable: false, shouldRedirect: false });

  if (!session.session || router.asPath === '/chat') {
    return null;
  }

  return <BotButton />;
};

export default ShowBotWhenLogged;
