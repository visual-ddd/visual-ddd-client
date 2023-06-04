export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export { webhook as default } from '@/modules/Lemon';
