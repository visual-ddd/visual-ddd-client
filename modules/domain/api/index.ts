import { encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import { getFilePath, readBuffer } from './utils';

/**
 * 获取完整载荷
 * @param req
 * @param res
 */
export async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const f = getFilePath(id as string);

  if (!(await fs.pathExists(f))) {
    res.status(204).end();
  } else {
    res.status(200);
    fs.createReadStream(f).pipe(res);
  }
}

/**
 * 获取偏移值
 * @param req
 * @param res
 */
export async function handleGetVector(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const f = getFilePath(id as string);

  // 不存在
  if (!(await fs.pathExists(f))) {
    res.status(204).end();
    return;
  }

  const data = await fs.readFile(f);
  const vector = encodeStateVectorFromUpdate(data);

  res.status(200).send(Buffer.from(vector));
}

export async function handleSave(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const f = getFilePath(id as string);

  // 全量保存
  if (!(await fs.pathExists(f))) {
    const fw = fs.createWriteStream(f);

    req.pipe(fw);

    res.status(200).end();

    return;
  }

  // 增量保存
  const data = await fs.readFile(f);
  const diff = await readBuffer(req);
  const update = mergeUpdates([data, diff]);
  fs.writeFile(f, Buffer.from(update));

  res.status(204).end();
}
