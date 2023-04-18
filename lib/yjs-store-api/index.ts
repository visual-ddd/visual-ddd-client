import { Doc as YDoc, encodeStateVectorFromUpdate, encodeStateAsUpdate, mergeUpdates, diffUpdate } from 'yjs';
import { NextApiRequest } from 'next';
import LRUCache from 'lru-cache';
import { withWakedataRequestApiRoute } from '@/modules/session/api-helper';
import { createFailResponse } from '@/modules/backend-node';

import { allowMethod } from '../api';

import { readBuffer, createDocFromUpdate, readBufferFromMultipart } from './utils';
import { RawYjsData, readRawData, toRawData } from './raw';

export interface YjsDocMetaInfo {
  name: string;
  title: string;
  description?: string;
}

export function createYjsStore(options: {
  transformYDocToDSL: (doc: YDoc) => any;
  createYDoc: (params: YjsDocMetaInfo) => YDoc;
  onSave: (params: { id: string; dsl: string; raw: RawYjsData; request: NextApiRequest }) => Promise<void>;
  onRequest: (params: { id: string; request: NextApiRequest }) => Promise<{ raw?: RawYjsData; meta: YjsDocMetaInfo }>;
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

  function addCacheWithRaw(id: string, raw: RawYjsData) {
    const data = readRawData(raw);
    return addCacheWithBuffer(id, data);
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
      raw: toRawData(data),
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
        const doc = createYDoc(detail.meta);
        const update = encodeStateAsUpdate(doc);
        const buf = Buffer.from(update);
        addCacheWithBuffer(id, buf);

        // 保存
        await save(req, id, buf);

        return buf;
      } else {
        // 转换为二进制
        const buf = addCacheWithRaw(id, detail.raw);

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

  /**
   * 获取差异值
   */
  const handleGetDiff = allowMethod(
    'POST',
    withWakedataRequestApiRoute(async (req, res) => {
      const vector = await readBuffer(req);

      const data = await getData(req);
      const diff = diffUpdate(data, vector);

      res.status(200).send(Buffer.from(diff));
    })
  );

  const handleSave = withWakedataRequestApiRoute(async (req, res) => {
    const id = req.query.id as string;
    const isDiff = req.query.diff === 'true';
    const diff = await readBuffer(req);

    let update: Uint8Array;

    if (isDiff) {
      // 增量保存
      const data = await getData(req);
      update = mergeUpdates([data, diff]);
    } else {
      // 全量保存
      update = diff;
    }

    let old = cache.get(id);
    try {
      const buff = addCacheWithBuffer(id, Buffer.from(update));

      const dsl = await save(req, id, buff);

      res.status(200).json(dsl);
    } catch (err) {
      // 恢复旧数据
      if (old) {
        cache.set(id, old);
      } else {
        cache.delete(id);
      }

      throw err;
    }
  });

  /**
   * 保存接口 v2
   *
   * 这个接口支持接收 vector
   *
   * 这个接口将返回更新而不是 DSL
   */
  const handleSaveV2 = withWakedataRequestApiRoute(async (req, res) => {
    const id = req.query.id as string;

    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      res.status(400).json(createFailResponse(400, 'content-type must be multipart/form-data'));
      return;
    }

    if (id == null) {
      res.status(400).json(createFailResponse(400, 'id is required'));
      return;
    }

    const isDiff = req.query.diff === 'true';

    const parts = (await readBufferFromMultipart(req)) as { vector?: Buffer; data: Buffer };

    if (!parts.data) {
      res.status(400).json(createFailResponse(400, 'data is required'));
      return;
    }

    let update: Uint8Array;

    if (isDiff) {
      // 增量保存
      const data = await getData(req);
      const diff = parts.data;
      update = mergeUpdates([data, diff]);
    } else {
      // 全量保存
      update = parts.data;
    }

    // 执行保存
    let old = cache.get(id);
    try {
      const buff = addCacheWithBuffer(id, Buffer.from(update));

      await save(req, id, buff);

      // 返回远程的增量更新
      let diff: Uint8Array | undefined;
      const fullUpdate = cache.get(id) || buff;
      if (parts.vector) {
        // 增量返回
        diff = diffUpdate(fullUpdate, parts.vector);
      } else {
        // 全量返回
        diff = fullUpdate;
      }
      res.status(200).send(Buffer.from(diff));
    } catch (err) {
      // 恢复旧数据
      if (old) {
        cache.set(id, old);
      } else {
        cache.delete(id);
      }

      throw err;
    }
  });

  return {
    addCacheWithBase64,
    addCacheWithBase64IfNeed,
    addCacheWithBuffer,
    addCacheWithRaw,
    handleGet,
    handleGetBase64,
    handleGetVector,
    handleGetDiff,
    handleSave,
    handleSaveV2,
  };
}
