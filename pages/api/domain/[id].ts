import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';

type Data = {
  name: string;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const f = path.join(__dirname, `${id}`);
  if (!(await fs.pathExists(f))) {
    res.status(204).end();
  } else {
    res.status(200);
    fs.createReadStream(f).pipe(res);
  }
}

// @ts-expect-error
async function readBuffer(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const list: any[] = [];
    req
      .on('data', data => {
        list.push(data);
      })
      .on('end', () => {
        const buffer = Buffer.concat(list);
        resolve(buffer);
      })
      .on('error', reject);
  });
}

export async function handleSave(req: NextApiRequest, res: NextApiResponse) {
  const f = path.join(__dirname, `${req.query.id}`);
  const fw = fs.createWriteStream(f);

  req.pipe(fw);

  res.status(204).end();
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
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
