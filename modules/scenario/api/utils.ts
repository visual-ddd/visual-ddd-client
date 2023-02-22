import type { NextApiRequest } from 'next';

/**
 * 从 request 中 读取 buffer
 * @param req
 * @returns
 */
export async function readBuffer(req: NextApiRequest): Promise<Buffer> {
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
