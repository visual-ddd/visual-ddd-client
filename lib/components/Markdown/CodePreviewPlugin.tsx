import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

export interface CodePreviewPluginOptions {
  consumer: {
    [language: string]: {
      // 返回true 表示 valid
      validate: (data: string) => boolean;
      // 返回图片 url
      transform: (data: string) => string | undefined;
    };
  };
}

export const CodePreviewPlugin: Plugin<[CodePreviewPluginOptions], Root> = function CodePreviewPlugin(options) {
  return function transformer(tree) {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang && !node?.data?.__code_review_transformed__ && options.consumer[node.lang]) {
        const { validate, transform } = options.consumer[node.lang];
        const value = node.value;

        if (index != null && validate(value)) {
          if (node.data) {
            node.data.__code_review_transformed__ = true;
          } else {
            node.data = { __code_review_transformed__: true };
          }

          const imageUrl = transform(value);

          if (imageUrl) {
            parent?.children.splice(index + 1, 0, {
              type: 'paragraph',
              children: [{ type: 'image', url: imageUrl, title: 'image preview' }],
            });
          }
        }
      }
    });

    return tree;
  };
};
