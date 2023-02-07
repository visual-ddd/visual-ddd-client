import { IronSessionOptions } from 'iron-session';

export const IRON_SESSION_OPTIONS: IronSessionOptions = {
  password: process.env.SESSION_SECRET ?? 'DEVELOPMENT_ONLY_PLEASE_CHANGE_ME',
  cookieName: 'vd-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
};
