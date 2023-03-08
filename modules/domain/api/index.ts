import type { DomainVersion } from '@/modules/team/types';

import { transformToDSL, createDoc } from './dsl/doc';
import { createYjsStore } from '@/lib/yjs-store-api';

const { addCacheWithRaw, handleGet, handleGetBase64, handleGetVector, handleSave } = createYjsStore({
  transformYDocToDSL: doc => {
    return transformToDSL(doc);
  },
  createYDoc: () => {
    return createDoc();
  },
  async onSave({ id, dsl, raw, request }) {
    await request.request('/wd/visual/web/domain-design-version/domain-design-dsl-update', {
      id,
      domainDesignDsl: dsl,
      graphDsl: raw,
    });
  },
  async onRequest({ id, request }) {
    const detail = await request.request<DomainVersion>(
      '/wd/visual/web/domain-design-version/domain-design-version-detail-query',
      { id },
      { method: 'GET' }
    );

    return { raw: detail.graphDsl };
  },
});

export { addCacheWithRaw, handleGet, handleGetBase64, handleGetVector, handleSave };
