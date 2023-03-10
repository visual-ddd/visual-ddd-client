import { Doc as YDoc, XmlElement, XmlText, Map as YMap, Array as YArray } from 'yjs';
import { buildEditorYjs, buildEmptyEditorYjs } from '@/lib/editor/Model/Yjs';
import { YjsDocMetaInfo } from '@/lib/yjs-store-api';
import { AggregationDSL, EntityDSL, TypeType, CommandDSL } from '@/modules/domain/domain-design/dsl/dsl';
import { buildUbiquitousLanguageYjs } from '@/modules/domain/ubiquitous-language-design/Yjs';
import { toNameCase } from '@/lib/utils';

import { YJS_FIELD_NAME } from '../../constants';

import * as DSL from './interface';
import { DSLModel } from './model';

/**
 * 创建业务域模型
 */
function createDomainModel(meta: YjsDocMetaInfo, map: YMap<unknown>) {
  const { name, title, description } = meta;

  buildEditorYjs(
    {
      nodes: [
        // 业务活动
        {
          id: '{activity-create}',
          name: 'activity',
          properties: {
            label: `新增${title}`,
            position: { x: 171, y: 181 },
            size: { width: 120, height: 75 },
          },
        },
        {
          id: '{activity-update}',
          name: 'activity',
          properties: {
            label: `编辑${title}`,
            position: { x: 443, y: 183.5 },
            size: { width: 120, height: 75 },
          },
        },
        {
          id: '{activity-delete}',
          name: 'activity',
          properties: {
            label: `删除${title}`,
            size: { width: 120, height: 70 },
            position: { x: 743, y: 183.5 },
          },
        },
        // 聚合
        {
          id: '{aggregation}',
          name: 'aggregation',
          properties: helper => {
            return {
              zIndex: 1,
              position: { x: 171, y: 715 },
              size: { width: 500, height: 500 },
              __prevent_auto_resize__: true,
              ...({
                uuid: helper.getId('aggregation'),
                name: toNameCase('CamelCase', name),
                title: title,
                description: description,
                meta: [],
                color: '#D9F7BE',
              } satisfies AggregationDSL),
            };
          },
          children: [
            {
              id: '{entity}',
              name: 'entity',
              properties: helper => ({
                position: { x: 231, y: 775 },
                zIndex: 2,
                size: { width: 200, height: 144.828125 },
                ...({
                  uuid: helper.getId('entity'),
                  name: toNameCase('CamelCase', name),
                  title: title,
                  description: description,
                  meta: [],
                  implements: [],
                  abstract: false,
                  methods: [],
                  classProperties: [],
                  classMethods: [],
                  isAggregationRoot: true,
                  id: helper.getOrCreateId('entity-id'),
                  properties: [
                    {
                      uuid: helper.getId('entity-id'),
                      name: 'id',
                      title: `${title} ID`,
                      description: '',
                      meta: [],
                      type: { type: TypeType.Base, name: 'Long' },
                      access: 'public',
                    },
                    {
                      uuid: helper.getOrCreateId(),
                      name: 'name',
                      title: '名称',
                      description: '',
                      meta: [],
                      type: { type: TypeType.Base, name: 'String' },
                      access: 'public',
                    },
                  ],
                } satisfies EntityDSL),
              }),
            },
          ],
        },

        // 命令
        {
          id: '{command-create}',
          name: 'command',
          properties: helper => ({
            position: { x: 106, y: 350 },
            zIndex: 2,
            size: { width: 200, height: 184.671875 },
            ...({
              uuid: helper.getId('command-create'),
              name: toNameCase('CamelCase', name) + 'Create',
              title: `新增${title}`,
              description: '',
              meta: [],
              repository: 'create',
              eventSendable: false,
              aggregation: { referenceId: helper.getId('aggregation') },
              category: 'create',
              source: {
                http: { enabled: true },
                rpc: { enabled: true },
                event: { enabled: false, value: '' },
                schedule: { enabled: false, value: '' },
              },
              properties: [
                {
                  uuid: helper.getOrCreateId(),
                  name: 'name',
                  title: '名称',
                  description: '',
                  meta: [],
                  type: { type: TypeType.Base, name: 'String' },
                  access: 'public',
                },
              ],
              eventProperties: [
                {
                  uuid: helper.getOrCreateId(),
                  name: 'id',
                  title: `${title} ID`,
                  description: '',
                  meta: [],
                  type: { type: TypeType.Base, name: 'Long' },
                  access: 'public',
                },
              ],
            } satisfies CommandDSL),
          }),
        },
        {
          id: '{command-modify}',
          name: 'command',
          properties: helper => ({
            position: { x: 425, y: 350 },
            size: { width: 200, height: 183.671875 },
            zIndex: 2,
            ...({
              uuid: helper.getId('command-modify'),
              name: toNameCase('CamelCase', name) + 'Modify',
              title: `编辑${title}`,
              description: '',
              meta: [],
              repository: 'modify',
              eventSendable: false,
              aggregation: { referenceId: helper.getId('aggregation') },
              category: 'modify',
              source: {
                http: { enabled: true },
                rpc: { enabled: true },
                event: { enabled: false, value: '' },
                schedule: { enabled: false, value: '' },
              },
              properties: [
                {
                  uuid: helper.getOrCreateId(),
                  name: 'id',
                  title: `${title} ID`,
                  description: '',
                  meta: [],
                  type: { type: TypeType.Base, name: 'Long' },
                  access: 'public',
                },
                {
                  uuid: helper.getOrCreateId(),
                  name: 'name',
                  title: '名称',
                  description: '',
                  meta: [],
                  type: { type: TypeType.Base, name: 'String' },
                  access: 'public',
                },
              ],
              eventProperties: [],
            } satisfies CommandDSL),
          }),
        },
        {
          id: '{command-remove}',
          name: 'command',
          properties: helper => ({
            position: { x: 743, y: 350 },
            size: { width: 200, height: 129.96875 },
            zIndex: 2,
            ...({
              uuid: helper.getId('command-remove'),
              name: toNameCase('CamelCase', name) + 'Remove',
              title: `删除${title}`,
              description: '',
              meta: [],
              repository: 'remove',
              eventSendable: false,
              aggregation: { referenceId: helper.getId('aggregation') },
              category: 'remove',
              source: {
                http: { enabled: true },
                rpc: { enabled: true },
                event: { enabled: false, value: '' },
                schedule: { enabled: false, value: '' },
              },
              properties: [
                {
                  uuid: helper.getOrCreateId(),
                  name: 'id',
                  title: `${title} ID`,
                  description: '',
                  meta: [],
                  type: { type: TypeType.Base, name: 'Long' },
                  access: 'public',
                },
              ],
              eventProperties: [],
            } satisfies CommandDSL),
          }),
        },
      ],
      edges: [
        {
          name: 'edge',
          source: {
            cell: '{activity-create}',
            port: 'right',
          },
          target: {
            cell: '{activity-update}',
            port: 'left',
          },
        },
        {
          name: 'edge',
          source: {
            cell: '{activity-update}',
            port: 'right',
          },
          target: {
            cell: '{activity-delete}',
            port: 'left',
          },
        },
      ],
    },
    map
  );
}

function createUbiquitousLanguages(array: YArray<YMap<string>>) {
  buildUbiquitousLanguageYjs(
    [
      { conception: '资源', englishName: 'Resource', definition: 'BD进行销售活动的对象', example: '', restraint: '' },
      {
        conception: '公海',
        englishName: 'PublicSea',
        definition: '业务目标限定的模拟资源全集',
        example: '业务目标是团购买单合作，限定POI为到餐全国和综合58同城的',
        restraint: '与业务目标对应，比如交易公海是为了做交易，推广公海是为了推广',
      },
    ],

    array
  );
}

export function createDoc(params: YjsDocMetaInfo) {
  const doc = new YDoc();

  const domainMap = doc.getMap(YJS_FIELD_NAME.DOMAIN);

  createDomainModel(params, domainMap);

  // 图形编辑器
  // 初始化根节点
  [YJS_FIELD_NAME.QUERY, YJS_FIELD_NAME.DATA_OBJECT, YJS_FIELD_NAME.MAPPER].forEach(name => {
    const map = doc.getMap(name);
    buildEmptyEditorYjs(map);
  });

  // 产品文档
  const product = doc.getXmlFragment(YJS_FIELD_NAME.PRODUCT);
  const productTemplate = new XmlElement('heading');
  productTemplate.setAttribute('level', '1');
  productTemplate.insert(0, [new XmlText(`${params.title}产品文档`)]);
  product.insert(0, [productTemplate]);

  // 产品愿景
  doc.getText(YJS_FIELD_NAME.VISION);

  // 统一语言
  const arr = doc.getArray<YMap<string>>(YJS_FIELD_NAME.UBIQUITOUS_LANGUAGE);
  createUbiquitousLanguages(arr);

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
