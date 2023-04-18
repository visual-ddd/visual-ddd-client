/* eslint-disable react-hooks/rules-of-hooks */
import ReactMarkdown, { Options } from 'react-markdown';
import RemarkMath from 'remark-math';
import RehypeKatex from 'rehype-katex';
import RemarkBreaks from 'remark-breaks';
import RemarkGfm from 'remark-gfm';
import type { PluggableList } from 'unified';

// 代码高亮
import RehypePrsim from 'rehype-prism-plus';
import { memo, useRef } from 'react';
import { message } from 'antd';
import 'katex/dist/katex.min.css';
import classNames from 'classnames';
import { CopyOutlined } from '@ant-design/icons';
import { Base64 } from 'js-base64';

import s from './index.module.scss';
import { CodePreviewPlugin } from './CodePreviewPlugin';
import { memoize } from 'lodash';

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

    return (
      <div className={s.codeBlock}>
        <div className={s.actions}>
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
      </div>
    );
  },
};

export interface MarkdownProps {
  className?: string;
  content: string;
}

const toDataUri = memoize(
  (svg: string, width?: number) => {
    const element = document.createElement('div');
    element.innerHTML = svg;
    const svgElement = element.querySelector('svg');
    if (svgElement) {
      if (width) {
        svgElement.setAttribute('width', `${width}px`);
      }
      const svgData = new XMLSerializer().serializeToString(svgElement).replace(/&nbsp;/g, '\u00a0');
      const encodedData = Base64.encode(svgData);
      return 'data:image/svg+xml;base64,' + encodedData;
    }

    return undefined;
  },
  (i, w) => `${i}-${w}`
);

const REMARK_PLUGINS: PluggableList = [
  [
    CodePreviewPlugin,
    {
      consumer: {
        svg: {
          validate(data: string) {
            return data.trimEnd().endsWith('</svg>');
          },
          transform(data: string) {
            return toDataUri(data, 500);
          },
        },
      },
    },
  ],
  RemarkMath,
  RemarkGfm,
  RemarkBreaks,
];

export const Markdown = memo((props: MarkdownProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={REMARK_PLUGINS}
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
