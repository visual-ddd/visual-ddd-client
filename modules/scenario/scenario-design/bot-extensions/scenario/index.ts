import { useCanvasModel } from '@/lib/editor';
import { v4 } from 'uuid';
import uniq from 'lodash/uniq';
import { useDesignerContext } from '@/lib/designer';
import { EdgeBindingProps } from '@/lib/g6-binding';
import type { Rectangle } from '@antv/x6';
import { useEffect } from 'react';
import { ExtensionType, registerExtension, responseMessage } from '@/lib/chat-bot';
import { createIdentityOpenAIEventSourceModel } from '@/lib/openai-event-source';
import { AITransformerParseError } from '@/lib/ai-directive-parser';
import { tryDispose } from '@/lib/utils';
import { ScenarioDesignerTabs } from '@/modules/scenario/constants';

import { ScenarioEditorModel } from '../../model';
import { DirectiveName, IFlowStore, ScenarioDirective, scenarioAITransformer } from '../../ai-transformer';
import { ScenarioObjectName, createActivityDSL, createDecisionDSL, createLabelEdge } from '../../dsl';

const TIP = `请输入提示, 比如:

用户注册，可以使用邮箱和手机号码进行注册

| 尽量详细地描述你的需求
`;

class FlowStore implements IFlowStore {
  editorModel: ScenarioEditorModel;

  private nameToId: Map<string, string> = new Map();
  readonly offset: { x: number; y: number } = { x: 0, y: 0 };

  readonly insertedCells: string[] = [];

  constructor(inject: { editorModel: ScenarioEditorModel; bbox: Rectangle | undefined | null }) {
    this.editorModel = inject.editorModel;
    if (inject.bbox) {
      this.offset = {
        x: 100,
        y: inject.bbox.y + inject.bbox.height,
      };
    }
  }

  createNode(directive: ScenarioDirective): void {
    const id = v4();
    let position: { x: number; y: number } | undefined;

    if ('x' in directive.params && 'y' in directive.params) {
      position = {
        x: directive.params.x + this.offset.x,
        y: directive.params.y + this.offset.y,
      };
    }

    switch (directive.type) {
      case DirectiveName.Start: {
        this.editorModel.commandHandler.createNode({
          id,
          name: ScenarioObjectName.Start,
          type: 'node',
          properties: {
            position,
          },
        });
        this.nameToId.set(DirectiveName.Start, id);
        console.log('插入开始节点', id);
        this.insertedCells.push(id);
        break;
      }
      case DirectiveName.End: {
        this.editorModel.commandHandler.createNode({
          id,
          name: ScenarioObjectName.End,
          type: 'node',
          properties: {
            position,
          },
        });
        this.nameToId.set(DirectiveName.End, id);
        console.log('插入结束节点', id);
        this.insertedCells.push(id);
        break;
      }
      case DirectiveName.Node: {
        const node = createActivityDSL();
        node.title = directive.params.label;

        this.editorModel.commandHandler.createNode({
          id: node.uuid,
          name: ScenarioObjectName.Activity,
          type: 'node',
          properties: { ...node, position },
        });
        this.nameToId.set(directive.params.name, node.uuid);
        console.log('插入节点', id, directive);

        this.insertedCells.push(id);
        break;
      }
      case DirectiveName.Condition: {
        const node = createDecisionDSL();
        node.title = directive.params.label;

        this.editorModel.commandHandler.createNode({
          id: node.uuid,
          name: ScenarioObjectName.Decision,
          type: 'node',
          properties: { ...node, position },
        });

        this.nameToId.set(directive.params.name, node.uuid);
        console.log('插入条件节点', id, directive);

        this.insertedCells.push(id);
        break;
      }
      case DirectiveName.Edge: {
        const fromId = this.nameToId.get(directive.params.from);
        const toId = this.nameToId.get(directive.params.to);
        let edge: EdgeBindingProps;

        if (directive.params.label) {
          edge = createLabelEdge();
          edge.label = directive.params.label;
        } else {
          edge = {};
        }
        edge.target = { cell: toId! };
        edge.source = { cell: fromId! };

        this.editorModel.commandHandler.createNode({
          id,
          name: directive.params.label ? ScenarioObjectName.LabelEdge : ScenarioObjectName.NormalEdge,
          type: 'edge',
          properties: edge,
        });

        console.log(
          '插入边',
          `from(${directive.params.from} -> ${fromId})`,
          `to(${directive.params.to} -> ${toId})`,
          directive
        );

        this.insertedCells.push(id);

        break;
      }
    }
  }
}

export function useScenarioBot() {
  const { model: canvasModel } = useCanvasModel();
  const model = canvasModel.editorModel as ScenarioEditorModel;
  const designer = useDesignerContext();

  /**
   * 获取已有内容的区域
   */
  const getContentBBox = () => {
    const graph = canvasModel.graph;
    if (!graph) {
      return;
    }

    const children = graph.getNodes().filter(i => i.shape !== ScenarioObjectName.LabelEdge);

    if (!children.length) {
      return;
    }

    const bbox = graph.getCellsBBox(children);

    return bbox;
  };

  useEffect(() => {
    if (model.readonly) {
      return;
    }

    return registerExtension({
      key: '流程图(测试)',
      match: '流程图(测试)',
      type: ExtensionType.Command,
      description: 'AI 绘制流程图',
      keepMatch: true,
      onSend(context) {
        const { message } = context;
        const content = message.trim();

        if (!content) {
          return responseMessage(TIP, context);
        }

        const eventSource = createIdentityOpenAIEventSourceModel();
        const result = (async () => {
          let rawResponse: string;
          try {
            // 激活标签页
            designer.setActiveTab({ tab: ScenarioDesignerTabs.Scenario });
            const res = (rawResponse = await eventSource.open('/api/rest/ai/flow-builder', {
              body: {
                text: message,
              },
              method: 'POST',
            }));

            const bbox = getContentBBox();
            const store = new FlowStore({ editorModel: model, bbox });
            const warning = scenarioAITransformer(res, store);

            if (warning.length) {
              context.bot.responseMessage(
                `执行完成, 以下是一些警告信息：\n\n${uniq(warning)
                  .map(i => `- ${i}`)
                  .join('  \n')}`,
                context.currentTarget
              );
            } else {
              context.bot.responseMessage('执行完成', context.currentTarget);
            }

            setTimeout(() => {
              canvasModel.handleZoomToFit();
              canvasModel.handleSelect({ cellIds: store.insertedCells });
            }, 500);
          } catch (err) {
            if (AITransformerParseError.isAITransformerParseError(err)) {
              context.bot.responseMessage(rawResponse!, context.currentTarget);
            } else {
              throw err;
            }
          }
        })();

        return {
          eventSource,
          result,
          dispose: () => tryDispose(eventSource),
        };
      },
    }) as any;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, designer]);
}
