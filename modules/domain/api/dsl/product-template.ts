import { XMLPresentation } from '@/lib/yjs-xml-fragment';
import { YjsDocMetaInfo } from '@/lib/yjs-store-api';

export function createProductionTemplate(meta: YjsDocMetaInfo): XMLPresentation.Node[] {
  return [
    {
      type: 'element',
      tag: 'heading',
      attrs: { textAlign: 'left', level: 2 },
      content: [{ type: 'text', deltas: [{ insert: meta.title }] }],
    },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    {
      type: 'element',
      tag: 'heading',
      attrs: { textAlign: 'left', level: 2 },
      content: [{ type: 'text', deltas: [{ insert: '约束和限制' }] }],
    },
    {
      type: 'element',
      tag: 'blockquote',
      attrs: {},
      content: [
        {
          type: 'element',
          tag: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', deltas: [{ insert: '【可选】' }] },
            { type: 'element', tag: 'hardBreak', attrs: {} },
            {
              type: 'text',
              deltas: [
                {
                  insert:
                    '列出明确的约束和限制，或者说要达到的目标，如性能指标，原则上这些指标需要优于技术委员会架构规范要求的指标，常见的约束和限制有：',
                },
              ],
            },
          ],
        },
        {
          type: 'element',
          tag: 'orderedList',
          attrs: { start: 1 },
          content: [
            {
              type: 'element',
              tag: 'listItem',
              attrs: {},
              content: [
                {
                  type: 'element',
                  tag: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: [{ type: 'text', deltas: [{ insert: '质量，扩展性要求' }] }],
                },
              ],
            },
            {
              type: 'element',
              tag: 'listItem',
              attrs: {},
              content: [
                {
                  type: 'element',
                  tag: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: [{ type: 'text', deltas: [{ insert: '性能要求' }] }],
                },
              ],
            },
            {
              type: 'element',
              tag: 'listItem',
              attrs: {},
              content: [
                {
                  type: 'element',
                  tag: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: [{ type: 'text', deltas: [{ insert: '安全要求' }] }],
                },
              ],
            },
            {
              type: 'element',
              tag: 'listItem',
              attrs: {},
              content: [
                {
                  type: 'element',
                  tag: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: [{ type: 'text', deltas: [{ insert: '项目时间要求' }] }],
                },
              ],
            },
            {
              type: 'element',
              tag: 'listItem',
              attrs: {},
              content: [
                {
                  type: 'element',
                  tag: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: [{ type: 'text', deltas: [{ insert: '硬件，软件选型要求' }] }],
                },
              ],
            },
            {
              type: 'element',
              tag: 'listItem',
              attrs: {},
              content: [
                {
                  type: 'element',
                  tag: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: [{ type: 'text', deltas: [{ insert: '成本的要求' }] }],
                },
              ],
            },
            {
              type: 'element',
              tag: 'listItem',
              attrs: {},
              content: [
                {
                  type: 'element',
                  tag: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: [{ type: 'text', deltas: [{ insert: '监管方的监管要求' }] }],
                },
              ],
            },
          ],
        },
        {
          type: 'element',
          tag: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            {
              type: 'text',
              deltas: [{ insert: 'Notice：', attributes: { bold: {} } }, { insert: '约束限制越多越好！' }],
            },
          ],
        },
        { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
      ],
    },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    {
      type: 'element',
      tag: 'heading',
      attrs: { textAlign: 'left', level: 2 },
      content: [{ type: 'text', deltas: [{ insert: '质量设计' }] }],
    },
    {
      type: 'element',
      tag: 'blockquote',
      attrs: {},
      content: [
        {
          type: 'element',
          tag: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [{ type: 'text', deltas: [{ insert: '【可选】' }] }],
        },
        {
          type: 'element',
          tag: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            {
              type: 'text',
              deltas: [
                {
                  insert:
                    '描述指令相关的设计，包括可观测性，可维护性，可测试性，成本设计等，比如单元测试需要达到的百分比，原则上这些设计指标需要优于技术委员会架构规范约定的指标',
                },
              ],
            },
          ],
        },
      ],
    },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    {
      type: 'element',
      tag: 'heading',
      attrs: { textAlign: 'left', level: 2 },
      content: [{ type: 'text', deltas: [{ insert: '演进规划' }] }],
    },
    {
      type: 'element',
      tag: 'blockquote',
      attrs: {},
      content: [
        {
          type: 'element',
          tag: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [{ type: 'text', deltas: [{ insert: '【可选】' }] }],
        },
        {
          type: 'element',
          tag: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', deltas: [{ insert: '可以是演进规划， 也可以是产品规划，描述每一个里程碑或者版本计划' }] },
          ],
        },
      ],
    },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    {
      type: 'element',
      tag: 'heading',
      attrs: { textAlign: 'left', level: 2 },
      content: [{ type: 'text', deltas: [{ insert: '其他' }] }],
    },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    {
      type: 'element',
      tag: 'blockquote',
      attrs: {},
      content: [
        {
          type: 'element',
          tag: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [{ type: 'text', deltas: [{ insert: '【可选】' }] }],
        },
        {
          type: 'element',
          tag: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', deltas: [{ insert: '如果复杂的，有架构设计等等的，可以再补充，或其他限制、注意事项等' }] },
            { type: 'element', tag: 'hardBreak', attrs: {} },
            { type: 'text', deltas: [{ insert: '如： 部署设计，风险评估，应对策略等' }] },
          ],
        },
      ],
    },
    { type: 'element', tag: 'paragraph', attrs: { textAlign: 'left' } },
    {
      type: 'element',
      tag: 'paragraph',
      attrs: { textAlign: 'left' },
      content: [{ type: 'element', tag: 'hardBreak', attrs: {} }],
    },
  ];
}
