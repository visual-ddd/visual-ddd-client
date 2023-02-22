import { Doc as YDoc, XmlElement, XmlText } from 'yjs';
import { NodeYMap, MapTypeRoot } from '@/lib/editor/Model/NodeYMap';

import { YJS_FIELD_NAME } from '../../constants';

import * as DSL from './interface';
import { DSLModel } from './model';

// 创建根节点，需要和 NodeYMap 保持同步
function createRoot() {
  return NodeYMap.fromNodePO({
    id: MapTypeRoot,
    parent: undefined,
    children: [],
    properties: {
      __node_name__: MapTypeRoot,
      __node_type__: 'node',
    },
  });
}

export function createDoc() {
  const doc = new YDoc();

  // 图形编辑器
  // 初始化根节点
  [YJS_FIELD_NAME.DOMAIN, YJS_FIELD_NAME.QUERY, YJS_FIELD_NAME.DATA_OBJECT, YJS_FIELD_NAME.MAPPER].forEach(name => {
    const map = doc.getMap(name);
    const root = createRoot();
    map.set(MapTypeRoot, root.toYMap());
  });

  // 产品文档
  const product = doc.getXmlFragment(YJS_FIELD_NAME.PRODUCT);
  const productTemplate = new XmlElement('heading');
  productTemplate.setAttribute('level', '1');
  productTemplate.insert(0, [new XmlText('产品文档')]);
  product.insert(0, [productTemplate]);

  // 产品愿景
  doc.getText(YJS_FIELD_NAME.VISION);

  // 统一语言
  doc.getArray(YJS_FIELD_NAME.UBIQUITOUS_LANGUAGE);

  return doc;
}

/**
 * 转换为 DSL
 * @param doc
 * @returns
 */
export function transformToDSL(doc: YDoc): DSL.BusinessDomainDSL {
  const model = new DSLModel(doc);

  return model.toDSL();
}
