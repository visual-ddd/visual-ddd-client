import { Doc as YDoc } from 'yjs';
import { MapTypeRoot, createRoot, NodeYMap } from '@/lib/editor/Model/NodeYMap';
import { v4 } from 'uuid';

import { ScenarioObjectName } from '../../scenario-design/dsl/constants';
import { YJS_FIELD_NAME } from '../../constants';

export function createDoc() {
  const doc = new YDoc();

  // 初始化业务场景泳道图
  {
    const scenarioMap = doc.getMap(YJS_FIELD_NAME.SCENARIO);

    const laneId = v4();
    const lane = NodeYMap.fromNodePO({
      id: laneId,
      parent: MapTypeRoot,
      children: [],
      properties: {
        __node_name__: ScenarioObjectName.Lane,
        __node_type__: 'node',
        position: { x: 10, y: 10 },
        uuid: laneId,
        name: 'lane',
        title: '泳道',
        description: '',
        meta: [],
        width: 1000,
        panes: [{ uuid: v4(), title: '未命名泳道', height: 300 }],
      },
    });

    const scenarioRoot = createRoot([laneId]);

    scenarioMap.set(MapTypeRoot, scenarioRoot.toYMap());
    scenarioMap.set(laneId, lane.toYMap());
  }

  // 图形编辑器
  // 初始化根节点
  [YJS_FIELD_NAME.SERVICE].forEach(name => {
    const map = doc.getMap(name);
    const root = createRoot();
    map.set(MapTypeRoot, root.toYMap());
  });

  return doc;
}

/**
 * 转换为 DSL
 * @param doc
 * @returns
 */
export function transformToDSL(doc: YDoc): unknown {
  return { TODO: '生成业务场景DSL' };
}
