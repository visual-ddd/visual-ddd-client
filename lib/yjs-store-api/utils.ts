import { Doc as YDoc, applyUpdate } from 'yjs';
import type { NextApiRequest } from 'next';
import type { Readable } from 'stream';
import busboy from 'busboy';

/**
 * 从 request 中 读取 buffer
 * @param req
 * @returns
 */
export async function readBuffer(req: NextApiRequest): Promise<Buffer> {
  return readBufferFromReadableStream(req);
}

export function readBufferFromReadableStream(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const list: any[] = [];
    stream
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

/**
 * 从 form/multipart 中读取 buffer
 * @param req
 * @returns
 */
export function readBufferFromMultipart(req: NextApiRequest): Promise<Record<string, Buffer>> {
  return new Promise<Record<string, Buffer>>((resolve, reject) => {
    const bb = busboy({ headers: req.headers });
    const task: Promise<void>[] = [];
    const result: Record<string, Buffer> = {};

    bb.on('file', (name, file) => {
      task.push(
        (async () => {
          const buffer = await readBufferFromReadableStream(file);
          result[name] = buffer;
        })()
      );
    });

    bb.on('error', err => {
      reject(err);
    });

    bb.on('close', async () => {
      try {
        await Promise.all(task);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });

    req.pipe(bb);
  });
}

/**
 * 创建文档
 * @param update
 * @returns
 */
export function createDocFromUpdate(update: Uint8Array) {
  const doc = new YDoc();

  applyUpdate(doc, update);

  return doc;
}
