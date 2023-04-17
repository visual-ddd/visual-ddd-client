/* eslint-disable react-hooks/rules-of-hooks */
import ReactMarkdown, { Options } from 'react-markdown';
import RemarkMath from 'remark-math';
import RehypeKatex from 'rehype-katex';
import RemarkBreaks from 'remark-breaks';
import RemarkGfm from 'remark-gfm';

// 代码高亮
import RehypePrsim from 'rehype-prism-plus';
import { memo, useRef, useState } from 'react';
import { message } from 'antd';
import 'katex/dist/katex.min.css';

import s from './index.module.scss';
import classNames from 'classnames';
import { CopyOutlined, PictureOutlined } from '@ant-design/icons';

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
  pre: (props: { children: any; className?: string }) => {
    const ref = useRef<HTMLPreElement>(null);
    const [svgContent, setSvgContent] = useState('');

    const isSVG = props.className?.includes('language-svg');

    return (
      <div className={s.codeBlock}>
        <div className={s.actions}>
          {isSVG && (
            <div
              className={classNames(s.action, s.svg)}
              onClick={() => {
                if (ref.current) {
                  const code = ref.current.innerText;
                  setSvgContent(code);
                }
              }}
            >
              <PictureOutlined />
            </div>
          )}
          <div
            className={classNames(s.action, s.copy)}
            onClick={() => {
              if (ref.current) {
                const code = ref.current.innerText;
                copy(code);
              }
            }}
          >
            <CopyOutlined />
          </div>
        </div>
        <pre ref={ref} className={props.className}>
          {props.children}
        </pre>
        {!!(isSVG && svgContent) && (
          <div className={s.svgPreview} dangerouslySetInnerHTML={{ __html: svgContent }}></div>
        )}
      </div>
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
