import type { NextApiRequest, NextApiResponse } from 'next';
import { handleGet, handleSave } from '@/modules/scenario/api';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await handleGet(req, res);
      break;
    case 'PUT':
      await handleSave(req, res);
      break;
    default:
      res.status(405).end('Method not allowed');
  }
}
