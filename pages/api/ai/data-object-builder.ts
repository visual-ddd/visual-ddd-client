export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export { dataObjectBuilder as default } from '@/modules/ai';
