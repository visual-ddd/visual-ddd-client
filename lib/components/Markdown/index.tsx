/* eslint-disable react-hooks/rules-of-hooks */
import ReactMarkdown, { Options } from 'react-markdown';
import RemarkMath from 'remark-math';
import RehypeKatex from 'rehype-katex';
import RemarkBreaks from 'remark-breaks';
import RemarkGfm from 'remark-gfm';

// 代码高亮
import RehypePrsim from 'rehype-prism-plus';
import { memo, useRef } from 'react';
import { message } from 'antd';
import 'katex/dist/katex.min.css';

import s from './index.module.scss';
import classNames from 'classnames';

const copy = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(res => {
      message.success('已复制');
    })
    .catch(err => {
      message.success(`复制失败: ${err.message}`);
    });
};

const COMPONENTS: Options['components'] = {
  pre: (props: { children: any }) => {
    const ref = useRef<HTMLPreElement>(null);

    return (
      <pre ref={ref}>
        <span
          className="copy-code-button"
          onClick={() => {
            if (ref.current) {
              const code = ref.current.innerText;
              copy(code);
            }
          }}
        ></span>
        {props.children}
      </pre>
    );
  },
};

export interface MarkdownProps {
  className?: string;
  content: string;
}

export const Markdown = memo((props: MarkdownProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
      rehypePlugins={[RehypeKatex, [RehypePrsim, { ignoreMissing: true }]]}
      className={classNames('vd-markdown markdown-body', s.root, props.className)}
      linkTarget="_blank"
      components={COMPONENTS}
    >
      {props.content}
    </ReactMarkdown>
  );
});

Markdown.displayName = 'Markdown';
