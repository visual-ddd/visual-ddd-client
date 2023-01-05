import type { NextApiRequest, NextApiResponse } from 'next';
import { handleGet, handleSave } from '@/modules/domain/api';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      handleGet(req, res);
      break;
    case 'PUT':
      handleSave(req, res);
      break;
    default:
      res.status(405).end('Method not allowed');
  }
}
