import { XmlElement, XmlFragment, XmlText } from 'yjs';

// 模板可以使用 https://astexplorer.net/#/KJ8AjD6maa posthtml-parser 生成
// 但是需要注意，这是一个 HTML parser, 对于一些自闭和标签，需要手动修改一下，比如 link
export namespace XMLPresentation {
  export type TextDelta = {
    insert: string;
    attributes?: Record<string, any>;
  };

  export type Text = {
    type: 'text';
    deltas: TextDelta[];
  };

  export interface Element {
    type: 'element';
    tag: string;
    attrs?: Record<string, string | number | undefined>;
    content?: Node[];
  }

  export type Node = Text | Element;
  export type Fragment = Node[];
}

/**
 * 将 XML Fragment 转换为 JSON
 * @param fragment
 * @returns
 */
export function xmlFragmentToJSON(fragment: XmlFragment): XMLPresentation.Node[] {
  const list = fragment.toArray();

  return list.map((i): XMLPresentation.Node => {
    if (i instanceof XmlText) {
      return {
        type: 'text',
        deltas: i.toDelta(),
      };
    } else if (i instanceof XmlElement) {
      const children = i.toArray();

      return {
        type: 'element',
        tag: i.nodeName,
        attrs: i.getAttributes(),
        content: children.length ? xmlFragmentToJSON(i) : undefined,
      };
    } else {
      throw new Error('Unexpected node type');
    }
  });
}

/**
 * 从 JSON 构建 XML Fragment
 * @param fragment
 * @param doc
 * @returns
 */
export function buildXmlFragmentFromJSON(fragment: XmlFragment, doc: XMLPresentation.Node[]) {
  const buildNode = (node: XMLPresentation.Node) => {
    const type = node.type;

    if (type === 'text') {
      const text = new XmlText();

      text.applyDelta(node.deltas);
      return text;
    } else {
      const element = new XmlElement(node.tag);

      if (node.attrs) {
        for (const [key, value] of Object.entries(node.attrs)) {
          element.setAttribute(key, value as any);
        }
      }

      if (node.content?.length) {
        const children = node.content.map(buildNode);

        element.push(children);
      }

      return element;
    }
  };

  const nodes = doc.map(buildNode);

  fragment.push(nodes);

  return fragment;
}
