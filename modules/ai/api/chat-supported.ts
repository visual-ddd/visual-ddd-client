import { allowMethod } from '@/lib/api';
import { chatSupported } from '../platform';
import { createSuccessResponse } from '@/modules/backend-node';

export const getChatSupported = allowMethod('GET', async (req, res) => {
  const supported = chatSupported();

  res.json(createSuccessResponse(supported));
});
