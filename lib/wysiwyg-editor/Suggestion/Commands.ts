import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from './suggestion';
import { getSuggestionItems } from './items';
import { renderItems } from './renderItem';

import { Item } from './types';

export const Commands = Extension.create({
  name: 'command',

  defaultOptions: {
    suggestion: {
      char: '/',
      startOfLine: false,
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
