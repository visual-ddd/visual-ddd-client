import type { ScenarioDetailPayload, ScenarioVersion } from '@/modules/team/types';
import { createYjsStore } from '@/lib/yjs-store-api';

import { transformToDSL, createDoc } from './dsl';

const { addCacheWithRaw, handleGet, handleGetBase64, handleGetVector, handleSave, handleSaveV2, handleGetDiff } =
  createYjsStore({
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
      // 版本详情
      const detail = await request.request<ScenarioVersion>(
        '/wd/visual/web/business-scene-version/business-scene-version-detail-query',
        { id },
        { method: 'GET' }
      );

      // 业务场景详情
      const scenario = await request.request<ScenarioDetailPayload>(
        '/wd/visual/web/business-scene/business-scene-detail-query',
        {
          id: detail.businessSceneId,
        },
        { method: 'GET' }
      );

      return {
        raw: detail.graphDsl,
        meta: {
          name: scenario.identity,
          title: scenario.name,
          description: scenario.description,
        },
      };
    },
  });

export { addCacheWithRaw, handleGet, handleGetBase64, handleGetVector, handleSave, handleSaveV2, handleGetDiff };
