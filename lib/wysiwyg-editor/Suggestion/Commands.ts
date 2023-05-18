import { Editor, Extension } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from './suggestion';
import { getSuggestionItems } from './items';
import { renderItems } from './renderItem';

import { Item } from './types';

const ALLOWED_TYPES = ['paragraph', 'heading'];

export function allowSuggestion(editor: Editor) {
  const { selection } = editor.state;
  const node = selection.$head.parent;
  const depth = selection.$head.depth;
  const type = node.type.name;

  return depth <= 3 && ALLOWED_TYPES.includes(type);
}

export const Commands = Extension.create({
  name: 'command',

  defaultOptions: {
    suggestion: {
      char: '/',
      startOfLine: false,
      allow: ({ editor }) => {
        return allowSuggestion(editor);
      },
      items: getSuggestionItems,
      render: renderItems,
      allowSpaces: false,
      command: ({ editor, range, props }) => {
        props.command({ editor, range, ...props });
      },
    } satisfies Omit<SuggestionOptions<Item>, 'editor'>,
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
