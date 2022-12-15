import { Cell, Edge } from '@antv/x6';
import { NoopArray } from '@wakeapp/utils';
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

  id: string;

  /**
   * 属性
   */
  properties: BaseNodeProperties;
}

export type CopyPayload =
  | ({ type: 'edge'; source: Edge.TerminalData; target: Edge.TerminalData } & CommonCopyPayload)
  | ({ type: 'node' } & CommonCopyPayload);

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
  const encoded = window.btoa(PAYLOAD_PREFIX + json);

  window.navigator.clipboard.writeText(encoded);
}

function tryParsePayload(text: string) {
  try {
    const source = window.atob(text);

    if (!source.startsWith(PAYLOAD_PREFIX)) {
      return null;
    }

    return JSON.parse(source.slice(PAYLOAD_PREFIX.length));
  } catch (err) {
    return null;
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
   * 粘贴后的偏移值, 默认 20, 默认会根据鼠标位置?
   */
  offset?: number;
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

  console.log(payload);
}
