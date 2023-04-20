import { Empty } from 'antd';
import { useMonaco } from '@/lib/monaco-editor';
import { useEffect, useRef } from 'react';
import type Monaco from 'monaco-editor';

import s from './DiffView.module.scss';

export interface DiffViewProps {
  left?: string;
  right?: string;
}

const Editor = (props: Required<DiffViewProps>) => {
  const { left, right } = props;
  const leftModel = useRef<Monaco.editor.ITextModel>();
  const rightModel = useRef<Monaco.editor.ITextModel>();

  const { element } = useMonaco(() => {
    const originalModel = (leftModel.current = monaco.editor.createModel(
      /* set from `originalModel`: */ `hello world`,
      'text/plain'
    ));
    const modifiedModel = (rightModel.current = monaco.editor.createModel(
      /* set from `modifiedModel`: */ `Hello World!s`,
      'text/plain'
    ));

    const diffEditor = monaco.editor.createDiffEditor(element.current!, {
      originalEditable: true,
      automaticLayout: true,
    });
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    return diffEditor;
  });

  useEffect(() => {
    leftModel.current?.setValue(left);
  }, [left]);

  useEffect(() => {
    rightModel.current?.setValue(right);
  }, [right]);

  return <div ref={element} className={s.editor}></div>;
};

export const DiffView = (props: DiffViewProps) => {
  const { left, right } = props;

  return (
    <div className={s.root}>
      {left == null || right == null ? (
        <Empty className={s.empty} description="请选择两个版本进行对比"></Empty>
      ) : (
        <Editor left={left} right={right} />
      )}
    </div>
  );
};
