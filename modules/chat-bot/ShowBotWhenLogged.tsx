import { useSession } from '@/modules/session';

import { BotButton } from './BotButton';

export const ShowBotWhenLogged = () => {
  const session = useSession({ immutable: false, shouldRedirect: false });

  if (!session.session) {
    return null;
  }

  return <BotButton />;
};
