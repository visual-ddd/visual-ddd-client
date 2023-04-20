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

  const { element, editor } = useMonaco(() => {
    const originalModel = (leftModel.current = monaco.editor.createModel(left || '', 'json'));
    const modifiedModel = (rightModel.current = monaco.editor.createModel(right || '', 'json'));

    const diffEditor = monaco.editor.createDiffEditor(element.current!, {
      originalEditable: false,
      readOnly: true,
      tabIndex: 2,
      automaticLayout: true,
      renderSideBySide: false,
      renderValidationDecorations: 'off',
      lineNumbers: 'off',
      contextmenu: false,
      codeLens: false,
    });

    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    return diffEditor;
  });

  useEffect(() => {
    if (left != null && editor.current) {
      const original = monaco.editor.createModel(left, 'json');
      leftModel.current?.dispose();
      editor.current?.setModel({
        ...editor.current.getModel()!,
        original,
      });
      leftModel.current = original;
    }
  }, [left, editor]);

  useEffect(() => {
    if (right != null && editor.current) {
      const modified = monaco.editor.createModel(right, 'json');
      rightModel.current?.dispose();
      editor.current?.setModel({
        ...editor.current.getModel()!,
        modified,
      });
      rightModel.current = modified;
    }
  }, [right, editor]);

  return <div ref={element} className={s.editor}></div>;
};

export const DiffView = (props: DiffViewProps) => {
  const { left, right } = props;

  return (
    <div className={s.root}>
      {!left || !right ? (
        <Empty className={s.empty} description="请选择两个版本进行对比"></Empty>
      ) : (
        <Editor left={left} right={right} />
      )}
    </div>
  );
};
