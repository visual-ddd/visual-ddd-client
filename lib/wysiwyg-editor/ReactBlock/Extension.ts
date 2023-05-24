import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ReactBlockComponent } from './ReactBlockComponent';

export const ReactBlock = Node.create({
  name: 'ReactBlock',
  group: 'block',
  atom: true,

  draggable: true,

  addAttributes() {
    return {
      name: {
        isRequired: true,
      },
      state: {
        parseHTML: el => {
          const data = el.getAttribute('state');
          if (data) {
            return JSON.parse(decodeURIComponent(data));
          }

          return {};
        },
        renderHTML: attributes => {
          return {
            state: encodeURIComponent(JSON.stringify(attributes.state)),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'react-block',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-block', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ReactBlockComponent);
  },
});
