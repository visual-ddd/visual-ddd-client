import type { DomainVersion, DomainDetailPayload } from '@/modules/team/types';

import { transformToDSL, createDoc } from './dsl/doc';
import { createYjsStore } from '@/lib/yjs-store-api';

const { addCacheWithRaw, handleGet, handleGetBase64, handleGetVector, handleSave, handleSaveV2, handleGetDiff } =
  createYjsStore({
    namespace: 'domain',
    transformYDocToDSL: doc => {
      return transformToDSL(doc);
    },
    createYDoc: params => {
      return createDoc(params);
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

      const domainDetail = await request.request<DomainDetailPayload>(
        '/wd/visual/web/domain-design/domain-design-detail-query',
        { id: detail.domainDesignId },
        { method: 'GET' }
      );

      return {
        raw: detail.graphDsl,
        meta: {
          name: domainDetail.identity,
          title: domainDetail.name,
          description: domainDetail.description,
        },
      };
    },
  });

export { addCacheWithRaw, handleGet, handleGetBase64, handleGetVector, handleSave, handleSaveV2, handleGetDiff };
