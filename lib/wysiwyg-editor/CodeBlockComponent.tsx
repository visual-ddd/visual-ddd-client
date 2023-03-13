import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import React from 'react';

import s from './CodeBlockComponent.module.scss';

export interface CodeBlockComponentProps extends NodeViewProps {}

export const CodeBlockComponent = (props: CodeBlockComponentProps) => {
  const { extension, updateAttributes, node } = props;
  const defaultLanguage = node.attrs.language;

  return (
    <NodeViewWrapper className={s.root}>
      <select
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={event => updateAttributes({ language: event.target.value })}
        className={s.select}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {extension.options.lowlight.listLanguages().map((lang: string, index: number) => (
          <option key={index} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};
