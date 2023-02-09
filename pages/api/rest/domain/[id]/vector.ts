import type { NextApiRequest, NextApiResponse } from 'next';
import { handleGetVector } from '@/modules/domain/api';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  handleGetVector(req, res);
}
