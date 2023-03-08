import { DagreLayout, Edge as EdgeModel } from '@antv/layout';
import type { Edge, Graph } from '@antv/x6';
import { cloneDeep, NoopArray } from '@wakeapp/utils';

export interface NodeBBox {
  id: string;
  size: {
    width: number;
    height: number;
  };
  x: number;
  y: number;
}

export const autoLayout = (graph: Graph) => {
  // 过滤掉子节点
  const nodes = graph.getNodes().filter(i => {
    return i.getParent() == null;
  });

  const edgesSet: Set<Edge> = new Set();

  for (const node of nodes) {
    const outgoings = graph.getOutgoingEdges(node);
    if (outgoings?.length) {
      for (const edge of outgoings) {
        edgesSet.add(edge);
      }
    }
  }

  const layout = new DagreLayout({
    type: 'dagre',
    rankdir: 'TB',
    nodesep: 30,
    ranksep: 40,
  });

  const input: { nodes: NodeBBox[]; edges: EdgeModel[] } = {
    nodes: [],
    edges: [],
  };

  for (const node of nodes) {
    const size = node.getSize();
    const position = node.getPosition();
    input.nodes.push({ id: node.id, size, x: position.x, y: position.y });
  }

  for (const edge of edgesSet.values()) {
    if (!edge.getTargetCellId()) {
      // 忽略没有目标的边
      continue;
    }

    input.edges.push({ source: edge.getSourceCellId(), target: edge.getTargetCellId() });
  }

  const output = layout.layout(cloneDeep(input));

  const nodesThatChanged: NodeBBox[] = [];

  for (const node of (output.nodes ?? NoopArray) as NodeBBox[]) {
    const inputNode = input.nodes?.find(i => i.id === node.id)!;

    if (inputNode.x !== node.x || inputNode.y !== node.y) {
      nodesThatChanged.push(node);
    }
  }

  return nodesThatChanged;
};
