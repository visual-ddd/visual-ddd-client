import { Doc as YDoc } from 'yjs';
import { buildEditorYjs, buildEmptyEditorYjs } from '@/lib/editor/Model/Yjs';
import { NoopArray } from '@wakeapp/utils';

import { ScenarioObjectName } from '../../scenario-design/dsl/constants';
import type { LanesDSL } from '../../scenario-design/dsl/dsl';
import { YJS_FIELD_NAME } from '../../constants';

import { DSLModel } from './model';
import { ScenarioDSL } from './interface';

/**
 * 创建初始化模板
 * @returns
 */
export function createDoc() {
  const doc = new YDoc();

  // 初始化业务场景泳道图
  const scenarioMap = doc.getMap(YJS_FIELD_NAME.SCENARIO);

  buildEditorYjs(
    {
      nodes: [
        {
          id: '{lane}',
          name: ScenarioObjectName.Lane,
          properties: helper => {
            return {
              position: { x: 10, y: 10 },
              ...({
                uuid: helper.getId('lane'),
                name: 'lane',
                title: '泳道',
                description: '',
                meta: [],
                width: 1200,
                panes: [{ uuid: helper.getOrCreateId(), title: '未命名泳道', height: 300 }],
              } satisfies LanesDSL),
            };
          },
        },
      ],
      edges: NoopArray,
    },
    scenarioMap
  );

  // 图形编辑器
  // 初始化根节点
  [YJS_FIELD_NAME.SERVICE].forEach(name => {
    const map = doc.getMap(name);
    buildEmptyEditorYjs(map);
  });

  return doc;
}

/**
 * 转换为 DSL
 * @param doc
 * @returns
 */
export function transformToDSL(doc: YDoc): ScenarioDSL {
  const model = new DSLModel(doc);

  return model.toDSL();
}
