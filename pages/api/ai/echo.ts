export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export { echo as default } from '@/modules/ai';
