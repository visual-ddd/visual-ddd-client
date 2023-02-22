import { Doc as YDoc } from 'yjs';
import { MapTypeRoot, createRoot } from '@/lib/editor/Model/NodeYMap';

import { YJS_FIELD_NAME } from '../../constants';

export function createDoc() {
  const doc = new YDoc();

  // 图形编辑器
  // 初始化根节点
  [YJS_FIELD_NAME.SCENARIO, YJS_FIELD_NAME.SERVICE].forEach(name => {
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
