import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

export interface CodePreviewPluginOptions {
  consumer: string[];
}

export const IMAGE_TITLE = 'CODE_RESULT_PREVIEW';

export const CodePreviewPlugin: Plugin<[CodePreviewPluginOptions], Root> = function CodePreviewPlugin(options) {
  return function transformer(tree) {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang && !node?.data?.__code_review_transformed__ && options.consumer.includes(node.lang)) {
        const value = node.value;

        if (index != null) {
          if (node.data) {
            node.data.__code_review_transformed__ = true;
          } else {
            node.data = { __code_review_transformed__: true };
          }

          parent?.children.splice(index + 1, 0, { type: 'image', alt: node.lang, url: value, title: IMAGE_TITLE });
        }
      }
    });

    return tree;
  };
};
