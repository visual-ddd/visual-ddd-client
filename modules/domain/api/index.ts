import { encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import { getFilePath, readBuffer } from './utils';
import { createDoc, transformToDSL } from './dsl/doc';

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
 * 获取完整载荷，base64
 * @param req
 * @param res
 */
export async function handleGetBase64(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const f = getFilePath(id as string);
  if (!(await fs.pathExists(f))) {
    res.status(204).end();
  } else {
    res.status(200);
    fs.createReadStream(f, 'base64').pipe(res);
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
  const fpath = getFilePath(id as string);
  const diff = await readBuffer(req);
  let update: Uint8Array;

  if (!(await fs.pathExists(fpath))) {
    // 全量保存
    update = diff;
    await fs.writeFile(fpath, diff);
  } else {
    // 增量保存
    const data = await fs.readFile(fpath);
    update = mergeUpdates([data, diff]);
    await fs.writeFile(fpath, Buffer.from(update));
  }

  const doc = createDoc(update);

  const dsl = transformToDSL(doc);

  res.status(200).send(dsl);
}
