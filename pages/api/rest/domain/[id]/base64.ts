import type { NextApiRequest, NextApiResponse } from 'next';
import { handleGetBase64 } from '@/modules/domain/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await handleGetBase64(req, res);
      break;
    default:
      res.status(405).end('Method not allowed');
  }
}
