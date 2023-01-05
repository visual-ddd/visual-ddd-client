import path from 'path';
import type { NextApiRequest } from 'next';
import os from 'os';

// TODO: REMOVE
export function getTempDir() {
  return os.tmpdir();
}

export function getFilePath(id: string) {
  return path.join(getTempDir(), `domain-${id}`);
}

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
