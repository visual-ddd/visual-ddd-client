import { NoopArray } from '@wakeapp/utils';
import { v4 } from 'uuid';
import { Map as YMap } from 'yjs';

import { NodeYMap, MapTypeRoot } from './NodeYMap';

const ROOT_ID = MapTypeRoot;

/**
 * 创建根节点，需要和 NodeYMap 保持同步
 */
export function createRoot(children: string[] = []) {
  return NodeYMap.fromNodePO({
    id: ROOT_ID,
    parent: undefined,
    children,
    properties: {
      __node_name__: ROOT_ID,
      __node_type__: 'node',
    },
  });
}

/**
 * 数据表述
 */
export namespace EditorYjsBuilder {
  /**
   * ID
   * ROOT 根节点 ID
   * {your input} 会自动生成 uuid
   * [your input] 原始值，将去掉 []
   */
  export type ID = `{${string}}` | `[${string}]`;

  export interface Property {
    [key: string]: any;
  }

  export interface Helper {
    /**
     * 是否已存在指定 id
     * @param name
     */
    hasId(name: string): boolean;

    /**
     * 获取指定标识符的 id, 如果不存在就创建一个
     * 如果 name 为空，就创建一个随机 id
     * @param name
     */
    getOrCreateId(name?: string): string;

    /**
     * 获取指定标识符的 id, 如果不存在就抛出错误
     * @param name
     */
    getId(name: string): string;
  }

  export interface Node {
    id: ID;
    /**
     * 节点名称
     */
    name: string;

    /**
     * 属性
     */
    properties?: Property | ((helper: Helper) => Property);

    /**
     * 子节点
     */
    children?: Node[];
  }

  export type EdgeTerminal =
    | ID
    | {
        cell: ID;
        port?: string;
      };

  export interface Edge {
    /**
     * 节点名称
     */
    name: string;

    /**
     * 来源节点
     */
    source: EdgeTerminal;

    /**
     * 目标节点
     */
    target: EdgeTerminal;

    /**
     * 属性
     */
    properties?: Property | ((helper: Helper) => Property);
  }

  export interface Representation {
    nodes: Node[];
    edges: Edge[];
  }
}

export class EditorYjsBuilderHelper implements EditorYjsBuilder.Helper {
  private map = new Map<string, string>();

  private createId() {
    return v4();
  }

  hasId(name: string): boolean {
    return this.map.has(name);
  }

  getOrCreateId(name?: string | undefined): string {
    if (name == null) {
      return this.createId();
    }

    if (this.map.has(name)) {
      return this.map.get(name)!;
    }

    const id = this.createId();
    this.map.set(name, id);

    return id;
  }

  getId(name: string): string {
    if (this.map.has(name)) {
      return this.map.get(name)!;
    }

    throw new Error('id not found: ' + name);
  }
}

/**
 * 从 JSON 数据表述中快速创建 yjs 数据
 * @param representation
 */
export function buildEditorYjs(representation: EditorYjsBuilder.Representation, datasource: YMap<unknown>) {
  const { nodes, edges } = representation;
  const helper = new EditorYjsBuilderHelper();

  const getId = (id: EditorYjsBuilder.ID, idMustExisted: boolean = false) => {
    if (id.startsWith('{')) {
      const realId = id.slice(1, -1);
      return idMustExisted ? helper.getId(realId) : helper.getOrCreateId(realId);
    } else {
      return id.slice(1, -1);
    }
  };

  const createTerminal = (terminal: EditorYjsBuilder.EdgeTerminal) => {
    if (typeof terminal === 'string') {
      return { cell: getId(terminal, true) };
    }

    const { cell, ...other } = terminal;

    return {
      cell: getId(cell, true),
      ...other,
    };
  };

  const register = (id: string, cell: YMap<unknown>) => {
    datasource.set(id, cell);
  };

  function createNodeMap(node: EditorYjsBuilder.Node, parent: string = ROOT_ID): { id: string; map: YMap<unknown> } {
    const { id, name, properties, children } = node;

    const idValue = getId(id);
    const propertiesValue = typeof properties === 'function' ? properties(helper) : properties;
    const childrenValue = children?.map(c => createNodeMap(c, idValue)) ?? [];

    const nodeYMap = NodeYMap.fromNodePO({
      id: idValue,
      parent: parent,
      children: childrenValue.map(i => i.id),
      properties: {
        __node_name__: name,
        __node_type__: 'node',
        ...propertiesValue,
      },
    });

    const nodeMap = nodeYMap.toYMap();

    register(idValue, nodeMap);

    return {
      id: idValue,
      map: nodeMap,
    };
  }

  function createEdge(edge: EditorYjsBuilder.Edge): { id: string; map: YMap<unknown> } {
    const { source, target, properties, name } = edge;

    const idValue = helper.getOrCreateId();
    const propertiesValue = typeof properties === 'function' ? properties(helper) : properties;
    const nodeYMap = NodeYMap.fromNodePO({
      id: idValue,
      parent: ROOT_ID,
      children: [],
      properties: {
        __node_name__: name,
        __node_type__: 'edge',
        source: createTerminal(source),
        target: createTerminal(target),
        ...propertiesValue,
      },
    });

    const edgeMap = nodeYMap.toYMap();

    register(idValue, edgeMap);

    return {
      id: idValue,
      map: edgeMap,
    };
  }

  const nodeMaps = nodes.map(n => createNodeMap(n));
  const edgeMaps = edges.map(e => createEdge(e));

  const root = createRoot(nodeMaps.map(n => n.id).concat(edgeMaps.map(e => e.id)));

  register(ROOT_ID, root.toYMap());

  return {
    root,
    nodeMaps,
    edgeMaps,
  };
}

export function buildEmptyEditorYjs(datasource: YMap<unknown>) {
  return buildEditorYjs(
    {
      nodes: NoopArray,
      edges: NoopArray,
    },
    datasource
  );
}
