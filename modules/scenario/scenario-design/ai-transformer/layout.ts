/**
 * 自动布局流程图
 */
import { DagreLayout, Edge as EdgeModel } from '@antv/layout';
import { NoopArray } from '@wakeapp/utils';
import {
  ScenarioDirective,
  NodeDirective,
  DirectiveName,
  StartDirective,
  EndDirective,
  ConditionDirective,
} from './protocol';

export interface NodeBBox {
  id: string;
  size: {
    width: number;
    height: number;
  };
  x: number;
  y: number;
}

export function autoLayout(directives: ScenarioDirective[]) {
  const layout = new DagreLayout({
    type: 'dagre',
    rankdir: 'LR',
    align: 'UL',
    nodesep: 40,
    ranksep: 20,
  });

  const input: { nodes: NodeBBox[]; edges: EdgeModel[] } = {
    nodes: [],
    edges: [],
  };

  for (const dir of directives) {
    switch (dir.type) {
      case DirectiveName.Start:
      case DirectiveName.End: {
        input.nodes.push({
          id: dir.type,
          size: {
            width: 50,
            height: 50,
          },
          x: 0,
          y: 0,
        });
        break;
      }
      case DirectiveName.Node:
      case DirectiveName.Condition: {
        input.nodes.push({
          id: dir.params.name,
          size: {
            width: 200,
            height: 50,
          },
          x: 0,
          y: 0,
        });
        break;
      }
      case DirectiveName.Edge: {
        input.edges.push({
          source: dir.params.from,
          target: dir.params.to,
        });
        break;
      }
    }
  }

  const output = layout.layout(input);

  for (const node of (output.nodes ?? NoopArray) as NodeBBox[]) {
    const id = node.id;
    switch (id) {
      case DirectiveName.Start:
      case DirectiveName.End: {
        const dir = directives.find((i): i is StartDirective | EndDirective => i.type === id);
        if (dir) {
          dir.params.x = node.x;
          dir.params.y = node.y;
        }
        break;
      }
      default: {
        const dir = directives.find(
          (i): i is ConditionDirective | NodeDirective =>
            (i.type == DirectiveName.Condition || i.type === DirectiveName.Node) && i.params.name === id
        );
        if (dir) {
          dir.params.x = node.x;
          dir.params.y = node.y;
        }
        break;
      }
    }
  }
}
