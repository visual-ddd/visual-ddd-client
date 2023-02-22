import { Doc as YDoc, encodeStateVectorFromUpdate, encodeStateAsUpdate, mergeUpdates } from 'yjs';
import { NextApiRequest } from 'next';
import LRUCache from 'lru-cache';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';

import { readBuffer, createDocFromUpdate } from './utils';
import { allowMethod } from '../api';

export function createYjsStore(options: {
  transformYDocToDSL: (doc: YDoc) => any;
  createYDoc: () => YDoc;
  onSave: (params: { id: string; dsl: string; raw: string; request: NextApiRequest }) => Promise<void>;
  onRequest: (params: { id: string; request: NextApiRequest }) => Promise<{ raw?: string }>;
}) {
  const { transformYDocToDSL, createYDoc, onSave, onRequest } = options;

  /**
   * 载荷缓存
   */
  const cache = new LRUCache<string, Buffer>({
    max: 200,
  });

  function addCacheWithBase64(id: string, dataInBase64: string) {
    const buf = Buffer.from(dataInBase64, 'base64');

    cache.set(id, buf);

    return buf;
  }

  function addCacheWithBase64IfNeed(id: string, dataInBase64: string) {
    if (cache.has(id)) {
      return;
    }

    const buf = Buffer.from(dataInBase64, 'base64');

    cache.set(id, buf);

    return buf;
  }

  function addCacheWithBuffer(id: string, buffer: Buffer) {
    cache.set(id, buffer);

    return buffer;
  }

  /**
   * 保存数据
   * @param req
   * @param id 版本 id
   * @param data
   */
  const save = async (req: NextApiRequest, id: string, data: Buffer) => {
    const doc = createDocFromUpdate(data);
    const dsl = transformYDocToDSL(doc);

    await onSave({
      id,
      dsl: JSON.stringify(dsl),
      raw: data.toString('base64'),
      request: req,
    });

    return dsl;
  };

  const getData = async (req: NextApiRequest): Promise<Buffer> => {
    const id = req.query.id as string;

    if (cache.has(id)) {
      // 存在缓存
      return cache.get(id)!;
    } else {
      // 远程获取结果
      const detail = await onRequest({ id, request: req });

      if (!detail.raw) {
        // 创建模板
        const doc = createYDoc();
        const update = encodeStateAsUpdate(doc);
        const buf = Buffer.from(update);
        addCacheWithBuffer(id, buf);

        // 保存
        await save(req, id, buf);

        return buf;
      } else {
        // 转换为二进制
        const buf = addCacheWithBase64(id, detail.raw);

        return buf;
      }
    }
  };

  /**
   * 获取完整载荷
   * @param req
   * @param res
   */
  const handleGet = withWakedataRequestApiRoute(async (req, res) => {
    const buf = await getData(req);
    res.status(200).send(buf);
  });

  /**
   * 获取完整载荷，base64
   * @param req
   * @param res
   */
  const handleGetBase64 = allowMethod(
    'GET',
    withWakedataRequestApiRoute(async (req, res) => {
      const buf = await getData(req);

      res.status(200).send(buf.toString('base64'));
    })
  );

  /**
   * 获取偏移值
   * @param req
   * @param res
   */
  const handleGetVector = allowMethod(
    'GET',
    withWakedataRequestApiRoute(async (req, res) => {
      const buffer = await getData(req);

      const vector = encodeStateVectorFromUpdate(buffer);

      res.status(200).send(Buffer.from(vector));
    })
  );

  const handleSave = withWakedataRequestApiRoute(async (req, res) => {
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

    const dsl = await save(req, id, buff);

    res.status(200).json(dsl);
  });

  return {
    addCacheWithBase64,
    addCacheWithBase64IfNeed,
    addCacheWithBuffer,
    handleGet,
    handleGetBase64,
    handleGetVector,
    handleSave,
  };
}
