import type { Editor, Range } from '@tiptap/core';

import { Item } from './types';
import { Bold, H1, H2, H3, H4 } from './icons';

enum Category {
  Heading = 'Heading',
  Mark = 'Mark',
}

const setHeading =
  (level: number) =>
  ({ editor, range }: { editor: Editor; range: Range }) => {
    editor.chain().focus().deleteRange(range).setNode('heading', { level }).run();
  };

const list: Item[] = [
  {
    name: 'Heading 1',
    title: '标题 1',
    icon: H1,
    category: Category.Heading,
    command: setHeading(1),
  },
  {
    name: 'Heading 2',
    title: '标题 2',
    icon: H2,
    category: Category.Heading,
    command: setHeading(2),
  },
  {
    name: 'Heading 3',
    title: '标题 3',
    icon: H3,
    category: Category.Heading,
    command: setHeading(3),
  },
  {
    name: 'Heading 4',
    title: '标题 4',
    icon: H4,
    category: Category.Heading,
    command: setHeading(4),
  },
  {
    name: 'Bold',
    title: '加粗',
    icon: Bold,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBold().run();
    },
    category: Category.Mark,
  },
  // {
  //   title: 'italic',
  //   command: ({ editor, range }) => {
  //     editor.chain().focus().deleteRange(range).setMark('italic').run();
  //   },
  //   category: Category.Mark,
  // },
  // {
  //   title: 'image',
  //   command: ({ editor, range }) => {
  //     console.log('call some function from parent');
  //     editor.chain().focus().deleteRange(range).setNode('paragraph').run();
  //   },
  // },
];

/**
 * 获取命令菜单
 * @param param0
 * @returns
 */
export const getSuggestionItems = ({ query }: { query: string; editor: Editor }) => {
  return list.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
};
