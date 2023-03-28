export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export { fallback as default } from '@/modules/ai';
