import type { ScenarioVersion } from '@/modules/team/types';
import { createYjsStore } from '@/lib/yjs-store-api';

import { transformToDSL, createDoc } from './dsl';

const {
  addCacheWithBase64,
  addCacheWithBase64IfNeed,
  addCacheWithBuffer,
  handleGet,
  handleGetBase64,
  handleGetVector,
  handleSave,
} = createYjsStore({
  transformYDocToDSL: doc => {
    return transformToDSL(doc);
  },
  createYDoc: () => {
    return createDoc();
  },
  async onSave({ id, dsl, raw, request }) {
    await request.request('/wd/visual/web/business-scene-version/business-scene-dsl-update', {
      id,
      dsl: dsl,
      graphDsl: raw,
    });
  },
  async onRequest({ id, request }) {
    const detail = await request.request<ScenarioVersion>(
      '/wd/visual/web/business-scene-version/business-scene-version-detail-query',
      { id },
      { method: 'GET' }
    );

    return { raw: detail.graphDsl };
  },
});

export {
  addCacheWithBase64,
  addCacheWithBase64IfNeed,
  addCacheWithBuffer,
  handleGet,
  handleGetBase64,
  handleGetVector,
  handleSave,
};
