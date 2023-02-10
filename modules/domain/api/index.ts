import { encodeStateVectorFromUpdate, encodeStateAsUpdate, mergeUpdates } from 'yjs';
import { NextApiRequest } from 'next';
import LRUCache from 'lru-cache';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';
import type { DomainVersion } from '@/modules/team/types';

import { readBuffer } from './utils';
import { createDocFromUpdate, transformToDSL, createDoc } from './dsl/doc';

/**
 * 载荷缓存
 */
const cache = new LRUCache<string, Buffer>({
  max: 200,
});

export function addCacheWithBase64(id: string, dataInBase64: string) {
  const buf = Buffer.from(dataInBase64, 'base64');

  cache.set(id, buf);

  return buf;
}

export function addCacheWithBase64IfNeed(id: string, dataInBase64: string) {
  if (cache.has(id)) {
    return;
  }

  const buf = Buffer.from(dataInBase64, 'base64');

  cache.set(id, buf);

  return buf;
}

export function addCacheWithBuffer(id: string, buffer: Buffer) {
  cache.set(id, buffer);

  return buffer;
}

const getData = async (req: NextApiRequest): Promise<Buffer> => {
  const id = req.query.id as string;

  if (cache.has(id)) {
    // 存在缓存
    return cache.get(id)!;
  } else {
    // 远程获取结果
    const detail = await req.request<DomainVersion>(
      '/wd/visual/web/domain-design-version/domain-design-version-detail-query',
      { id },
      { method: 'GET' }
    );

    if (!detail.graphDsl) {
      // 创建模板
      const doc = createDoc();
      const update = encodeStateAsUpdate(doc);
      const buf = Buffer.from(update);
      addCacheWithBuffer(id, buf);

      return buf;
    } else {
      // 转换为二进制
      const buf = addCacheWithBase64(id, detail.graphDsl);

      return buf;
    }
  }
};

/**
 * 获取完整载荷
 * @param req
 * @param res
 */
export const handleGet = withWakedataRequestApiRoute(async (req, res) => {
  const buf = await getData(req);
  res.status(200).send(buf);
});

/**
 * 获取完整载荷，base64
 * @param req
 * @param res
 */
export const handleGetBase64 = withWakedataRequestApiRoute(async (req, res) => {
  const buf = await getData(req);

  res.status(200).send(buf.toString('base64'));
});

/**
 * 获取偏移值
 * @param req
 * @param res
 */
export const handleGetVector = withWakedataRequestApiRoute(async (req, res) => {
  const buffer = await getData(req);

  const vector = encodeStateVectorFromUpdate(buffer);

  res.status(200).send(Buffer.from(vector));
});

export const handleSave = withWakedataRequestApiRoute(async (req, res) => {
  const id = req.query.id as string;
  const diff = await readBuffer(req);

  let update: Uint8Array;

  if (!cache.has(id)) {
    // 全量保存
    update = diff;
  } else {
    // 增量保存
    const data = cache.get(id)!;
    update = mergeUpdates([data, diff]);
  }

  const buff = addCacheWithBuffer(id, Buffer.from(update));
  const doc = createDocFromUpdate(update);
  const dsl = transformToDSL(doc);

  await req.request('/wd/visual/web/domain-design-version/domain-design-dsl-update', {
    id,
    domainDesignDsl: JSON.stringify(dsl),
    graphDsl: buff.toString('base64'),
  });

  res.status(200).json(dsl);
});
