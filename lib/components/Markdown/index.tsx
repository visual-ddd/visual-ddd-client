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
import { MermaidComponent } from '@/lib/components/Mermaid';

import s from './index.module.scss';
import { CodePreviewPlugin, IMAGE_TITLE } from './CodePreviewPlugin';

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

function isValidSvg(svg: string) {
  return svg?.trimEnd().endsWith('</svg>');
}

const COMPONENTS: Options['components'] = {
  img: props => {
    if (props.title === IMAGE_TITLE) {
      let src = props.src;

      if (!src) {
        return null;
      }

      src = decodeURI(src);

      if (props.alt === 'svg') {
        if (props.src && isValidSvg(src)) {
          // SVG 渲染
          return <div style={{ maxWidth: 500 }} dangerouslySetInnerHTML={{ __html: src }}></div>;
        }
      } else if (props.alt === 'mermaid') {
        return <MermaidComponent style={{ background: 'white' }} code={src}></MermaidComponent>;
      }

      return null;
    }

    return <img src={props.src} />;
  },
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

const REMARK_PLUGINS: PluggableList = [
  [CodePreviewPlugin, { consumer: ['svg', 'mermaid'] }],
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
