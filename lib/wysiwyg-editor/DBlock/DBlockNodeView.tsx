/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import { NodeViewWrapper, NodeViewProps, NodeViewContent } from '@tiptap/react';

import s from './index.module.scss';
import { HolderOutlined, PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';

export const DBlockNodeView: React.FC<NodeViewProps> = ({ node, selected, getPos, editor }) => {
  const createNodeAfter = () => {
    const pos = getPos() + node.nodeSize;

    editor.commands.insertContentAt(pos, {
      type: 'dBlock',
      content: [
        {
          type: 'paragraph',
        },
      ],
    });
  };

  const focusNode = () => {
    editor.chain().setNodeSelection(getPos()).run();
  };

  return (
    <NodeViewWrapper as="div" className={classNames(s.root, { selected })}>
      <section className={s.actions} aria-label="left-menu" contentEditable={false}>
        <div className={s.plus} onClick={createNodeAfter}>
          <PlusOutlined />
        </div>
        <div className={s.handle} onClick={focusNode} contentEditable={false} draggable data-drag-handle>
          <HolderOutlined />
        </div>
      </section>

      <NodeViewContent className={s.content} />
    </NodeViewWrapper>
  );
};
