import { Cell, Edge, PointLike, Size } from '@antv/x6';
import { isObject, NoopArray } from '@wakeapp/utils';
import { v4 } from 'uuid';
import { Base64 } from 'js-base64';

import { BaseNodeProperties } from '../Model';

/**
 * 剪切板相关工具类
 */

interface CommonCopyPayload {
  /**
   * 父节点
   */
  parent?: string;

  /**
   * 子节点
   */
  children?: string[];

  /**
   * 唯一 id
   */
  id: string;

  /**
   * 属性
   */
  properties: BaseNodeProperties;
}

export type CopyPayload =
  | ({ type: 'edge'; source: Edge.TerminalData; target: Edge.TerminalData } & CommonCopyPayload)
  | ({ type: 'node'; position: PointLike; size: Size } & CommonCopyPayload);

function isBaseNodeProperties(data: any): data is BaseNodeProperties {
  return isObject(data) && '__node_name__' in data;
}

/**
 * 序列化为复制载荷
 */
function serializeToCopyPayload(cells: Cell[]): CopyPayload[] {
  if (cells.length === 0) {
    return NoopArray;
  }

  const payload: CopyPayload[] = [];

  for (const cell of cells) {
    const json = cell.toJSON();

    if (!isBaseNodeProperties(json.data)) {
      continue;
    }

    const item: CommonCopyPayload = {
      properties: json.data,
      id: json.id!,
      parent: json.parent,
      children: json.children,
    };

    console.log(json);

    if (cell.isEdge()) {
      payload.push({
        ...item,
        type: 'edge',
        source: json.source,
        target: json.target,
      });
    } else {
      payload.push({
        type: 'node',
        position: json.position,
        size: json.size,
        ...item,
      });
    }
  }

  return payload;
}

const PAYLOAD_PREFIX = `__visual_ddd__`;

/**
 * 放置到剪切板中
 */
export function copy(cells: Cell[]) {
  const payload = serializeToCopyPayload(cells);

  if (!payload.length) {
    return;
  }

  const json = JSON.stringify(payload);
  const encoded = Base64.encode(PAYLOAD_PREFIX + json);

  window.navigator.clipboard.writeText(encoded);
}

function tryParsePayload(text: string): CopyPayload[] | null {
  try {
    const source = Base64.decode(text);

    if (!source.startsWith(PAYLOAD_PREFIX)) {
      return null;
    }

    return JSON.parse(source.slice(PAYLOAD_PREFIX.length));
  } catch (err) {
    console.warn(`粘贴错误: `, err);
    return null;
  }
}

function resetId(payload: CopyPayload[]) {
  const idMap: Record<string, string> = {};

  const resetTerminalData = (ter: Edge.TerminalData) => {
    if (ter == null) {
      return ter;
    }

    if ('cell' in ter) {
      const td = ter as Edge.TerminalCellData; // 序列化之后的一定是 TerminalCellData
      td.cell = idMap[td.cell];
    }
  };

  // 先处理所有节点
  for (const item of payload) {
    const newId = 'copy-' + v4();
    item.id = idMap[item.id] = newId;
  }

  // 处理边, parent, children
  for (const item of payload) {
    item.parent = item.parent && idMap[item.parent];
    item.children = item.children && item.children.map(i => idMap[i]);

    if (item.type === 'node') {
      continue;
    }

    resetTerminalData(item.source);
    resetTerminalData(item.target);
  }
}

function getVertex(payload: CopyPayload[]) {
  let x = Infinity;
  let y = Infinity;

  for (const item of payload) {
    if (item.type === 'node') {
      x = Math.min(item.position.x, x);
      y = Math.min(item.position.y, y);
    }
  }

  return { x, y };
}

function translate(payload: CopyPayload[], offsetX: number, offsetY: number) {
  const translateTerminalData = (ter: Edge.TerminalData) => {
    if (ter == null) {
      return ter;
    }

    if ('x' in ter) {
      ter.x += offsetX;
      ter.y += offsetY;
    }
  };

  for (const item of payload) {
    if (item.type === 'node') {
      item.position.x += offsetX;
      item.position.y += offsetY;
    } else {
      translateTerminalData(item.source);
      translateTerminalData(item.target);
    }
  }
}

function normalized(payload: CopyPayload[]) {
  for (const item of payload) {
    if (item.type === 'node') {
      item.properties.position = item.position;
      item.properties.size = item.size;
    } else {
      item.properties.source = item.source;
      item.properties.target = item.target;
    }
  }
}

/**
 * 粘贴
 * TODO: 暂时不支持剪切
 * @param options
 */
export async function paste(options: {
  /**
   * 白名单，默认允许所有组件类型
   * 在跨画布编辑时最好指定
   */
  whitelist?: string[];

  /**
   * 插入的位置(通常是鼠标当前的位置)，可选
   */
  position?: PointLike;

  /**
   * 粘贴后的偏移值, 默认 20, 默认会根据鼠标位置?
   */
  offset?: number;

  /**
   * 粘贴前回调
   * @returns
   */
  beforePaste: () => void;

  /**
   * 遍历器，paste 会按照树的顺序遍历节点, 你可以在这个方法中进行创建
   * @param item
   * @returns
   */
  visitor: (item: CopyPayload) => void;
}) {
  const text = await window.navigator.clipboard.readText();
  if (!text) {
    return;
  }

  const payload = tryParsePayload(text);

  if (!payload?.length) {
    return;
  }

  // 对拷贝内容进行预处理
  // id 重新生成
  // position 偏移
  // 数据规范化
  const { offset, position, whitelist, visitor, beforePaste } = options;

  if (
    whitelist?.length &&
    payload.some(i => {
      return !whitelist.includes(i.properties.__node_name__);
    })
  ) {
    return;
  }

  resetId(payload);

  let offsetX = offset ?? 20;
  let offsetY = offset ?? 20;

  if (position) {
    // 偏移
    const { x, y } = getVertex(payload);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      offsetX = position.x - x;
      offsetY = position.y - y;
    }
  }

  translate(payload, offsetX, offsetY);

  normalized(payload);

  // 按照树的顺序遍历, 边最后阶段再添加
  const nodeRoots: CopyPayload[] = [];
  const edges: CopyPayload[] = [];
  const mapById: Map<string, CopyPayload> = new Map();

  for (const item of payload) {
    mapById.set(item.id, item);
    if (item.parent == null && item.type === 'node') {
      nodeRoots.push(item);
    }

    if (item.type === 'edge') {
      edges.push(item);
    }
  }

  const visitNode = (item: CopyPayload) => {
    // 深度递归
    if (item.type !== 'node') {
      return;
    }

    visitor(item);
    mapById.delete(item.id);

    if (item.children?.length) {
      for (const child of item.children) {
        const item = mapById.get(child);
        if (item) {
          visitNode(item);
        }
      }
    }
  };

  if (nodeRoots.length || edges.length) {
    beforePaste?.();
  }

  for (const root of nodeRoots) {
    visitNode(root);
  }

  for (const edge of edges) {
    visitor(edge);
  }
}
