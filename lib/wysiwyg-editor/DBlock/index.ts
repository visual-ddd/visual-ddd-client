import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { DBlockNodeView } from './DBlockNodeView';
import { isActive as isSuggestionActive } from '../Suggestion';

export interface DBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dBlock: {
      /**
       * Toggle a dBlock
       */
      setDBlock: (position?: number) => ReturnType;
    };
  }
}

export const DBlock = Node.create<DBlockOptions>({
  name: 'dBlock',

  priority: 1000,

  group: 'dBlock',

  // 只能包含一个块
  // FIXME: 在列表中连续换行会报错
  content: 'block',

  draggable: true,

  selectable: true,

  inline: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="d-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'd-block' }), 0];
  },

  // addCommands() {
  //   return {
  //     setDBlock:
  //       position =>
  //       ({ state, chain }) => {
  //         const {
  //           selection: { from },
  //         } = state;

  //         const pos = position !== undefined || position !== null ? from : position;

  //         return chain()
  //           .insertContentAt(pos, {
  //             type: this.name,
  //             content: [
  //               {
  //                 type: 'paragraph',
  //               },
  //             ],
  //           })
  //           .focus(pos + 2)
  //           .run();
  //       },
  //   };
  // },

  addNodeView() {
    return ReactNodeViewRenderer(DBlockNodeView);
  },

  onTransaction({ transaction }) {
    console.log(transaction);
  },

  addKeyboardShortcuts() {
    return {
      // 'Mod-Alt-0': () => this.editor.commands.setDBlock(),
      Enter: ({ editor }) => {
        const {
          selection: { $head, from, to },
          doc,
        } = editor.state;

        const parent = $head.node($head.depth - 1);

        if (parent.type.name !== 'dBlock' || $head.parent.type.name === 'codeBlock') return false;

        if (isSuggestionActive(editor)) {
          return false;
        }

        let currentActiveNodeTo = -1;

        doc.descendants((node, pos) => {
          if (currentActiveNodeTo !== -1) return false;
          // eslint-disable-next-line consistent-return
          if (node.type.name === this.name) return;

          const [nodeFrom, nodeTo] = [pos, pos + node.nodeSize];

          if (nodeFrom <= from && to <= nodeTo) currentActiveNodeTo = nodeTo;

          return false;
        });

        let content = doc.slice(from, currentActiveNodeTo)?.toJSON().content as {
          type: string;
          attrs: Record<string, any>;
          content?: any;
        }[];

        if (
          !content.length ||
          (content.length === 1 && content[0].content == null && content[0].type !== 'paragraph')
        ) {
          // 没有实际内容
          content = [
            {
              type: 'paragraph',
              attrs: {
                textAlign: 'left',
              },
            },
          ];
        }

        return editor
          .chain()
          .insertContentAt(
            { from, to: currentActiveNodeTo },
            {
              type: this.name,
              content,
            }
          )
          .focus(from + 4)
          .run();
      },
    };
  },
});
