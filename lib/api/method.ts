import { NextApiHandler } from 'next';

export function allowMethod(method: 'GET' | 'POST' | 'PUT' | 'DELETE', handler: NextApiHandler): NextApiHandler {
  return (req, res) => {
    if (req.method !== method) {
      res.status(405).end();
    } else {
      return handler(req, res);
    }
  };
}
