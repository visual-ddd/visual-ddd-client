import { MindMapNodeShape, MindMapNode } from './types';

const SHAPES: Record<MindMapNodeShape, [string, string]> = {
  square: ['[', ']'],
  'rounded-square': ['(', ')'],
  circle: ['((', '))'],
  bang: ['))', '(('],
  cloud: [')', '('],
  hexagon: ['{{', '}}'],
  default: ['', ''],
};

// 转义特殊字符
const ESCAPE_REG = /[\[\]\(\)<>]/g;

function isIncludeSpecialChar(str: string) {
  return str.match(ESCAPE_REG);
}

/**
 * 转换数为 mermaid mindmap 代码
 * @param tree
 * @returns
 */
export function mindMapNodeToMermaidCode(tree: MindMapNode): string {
  let uid = 1;
  const list: string[] = [];

  const walk = (node: MindMapNode, depth: number): void => {
    const { name, shape = 'default', children } = node;
    const id = uid++;

    const shapePair = SHAPES[shape];
    const isNameIncludeSpecialChar = isIncludeSpecialChar(name);
    const code =
      shape === 'default'
        ? // 包含特殊字符会进行回退
          isNameIncludeSpecialChar
          ? `${id}("${name}")`
          : name
        : `${isNameIncludeSpecialChar ? id : name}${shapePair[0]}"${name}"${shapePair[1]}`;
    const indent = '  '.repeat(depth);
    list.push(`${indent}${code}`);

    if (children?.length) {
      for (const child of children) {
        walk(child, depth + 1);
      }
    }
  };

  walk(tree, 1);

  return 'mindmap\n' + list.join('\n');
}
