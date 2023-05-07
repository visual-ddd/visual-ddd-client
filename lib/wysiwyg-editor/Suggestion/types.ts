import type { Editor, Range } from '@tiptap/core';

export interface Props {}

export interface Item {
  /**
   * 英文名称
   */
  name: string;

  /**
   * 可读标题
   */
  title: string;

  icon?: React.ComponentType;

  /**
   * 执行命令
   * @param props
   * @returns
   */
  command: (props: CommandParams) => void;

  /**
   * 分类
   */
  category: string;
}

interface CommandParams extends Props {
  editor: Editor;
  range: Range;
}
