import type { Editor, Range } from '@tiptap/core';
import Fuse from 'fuse.js';

import { Item } from './types';
import { Paragraph, H1, H2, H3, H4, Code, List, ListOrder, Quote } from './icons';
import { ReactBlockRegistry } from '../ReactBlock';

enum Category {
  Heading = 'Heading',
  Mark = 'Mark',
  Basic = 'Basic',
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
    name: 'Paragraph',
    category: Category.Basic,
    title: '段落',
    icon: Paragraph,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('paragraph').run();
    },
  },

  {
    name: 'Code',
    category: Category.Basic,
    title: '代码块',
    icon: Code,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },

  {
    name: 'List',
    category: Category.Basic,
    title: '列表',
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },

  {
    name: 'OrderList',
    category: Category.Basic,
    title: '有序列表',
    icon: ListOrder,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },

  {
    name: 'Quote',
    category: Category.Basic,
    title: '引述',
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },

  // {
  //   name: 'Bold',
  //   title: '加粗',
  //   icon: Bold,
  //   command: ({ editor, range }) => {
  //     editor.chain().focus().deleteRange(range).toggleBold().run();
  //   },
  //   category: Category.Mark,
  // },
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

let fuse: Fuse<Item>;
let allList: Item[];

/**
 * 获取命令菜单
 * @param param0
 * @returns
 */
export const getSuggestionItems = ({ query }: { query: string; editor: Editor }) => {
  if (!fuse) {
    const customBlocks = Array.from(ReactBlockRegistry.registered().values()).map(i => {
      return {
        name: i.name,
        icon: i.icon,
        title: i.title,
        category: 'Block',
        command: ({ editor, range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent(
              `<react-block name="${i.name}" state="${encodeURIComponent(
                JSON.stringify(i.initialState())
              )}"></react-block>`
            )
            .run();
        },
      } satisfies Item;
    });

    allList = list.concat(customBlocks);

    fuse = new Fuse(allList, {
      keys: ['name', 'title'],
    });
  }

  if (!query) {
    return allList;
  }

  const res = fuse.search(query);
  return res.map(i => i.item);
};
