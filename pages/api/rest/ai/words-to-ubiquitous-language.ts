export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export { wordsToUbiquitousLanguage as default } from '@/modules/ai';
