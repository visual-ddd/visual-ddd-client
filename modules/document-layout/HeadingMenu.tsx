import { Anchor, AnchorProps } from 'antd';
import type { AnchorLinkItemProps } from 'antd/es/anchor/Anchor';
import { useEffect, useRef, useState } from 'react';
import { debounce } from '@wakeapp/utils';

import s from './HeadingMenu.module.scss';

export interface HeadingMenuProps {}

interface Item extends AnchorLinkItemProps {
  level: number;
}

const LEVEL_MAP: Record<string, number> = {
  H1: 1,
  H2: 2,
  H3: 3,
  H4: 4,
  H5: 5,
  H6: 6,
};

const isHeading = (node: Node): node is HTMLElement => {
  return node.nodeName in LEVEL_MAP;
};

const toValidHtmlId = (text: string) => {
  text = encodeURIComponent(text);

  let result = '';
  for (let i = 0; i < text.length; i++) {
    let char = text.charAt(i);
    if (/[a-zA-Z0-9]/.test(char)) {
      result += char;
    } else if (char === ' ') {
      result += '-';
    }
  }
  return result.toLowerCase();
};

export const HeadingMenu = (props: HeadingMenuProps) => {
  const [tree, setTree] = useState<AnchorProps['items']>();
  // 通过 snapshot 来强制 Anchor 重新渲染
  const [snapshot, setSnapshot] = useState(0);
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = element.current?.parentElement;

    if (!container) {
      return;
    }

    const update = debounce(() => {
      // 查找当前页面并建立索引
      const headings = container.querySelectorAll('h1, h2, h3, h4');
      const roots: Item[] = [];

      const stack: Item[] = [];

      let uuid = 0;

      const getOrCreateId = (heading: Element) => {
        if (heading.id) {
          return heading.id;
        }

        return (heading.id = toValidHtmlId(heading.textContent ?? '') + '-' + uuid++);
      };

      const appendChild = (parent: Item, item: Item) => {
        if (parent.children) {
          parent.children.push(item);
        } else {
          parent.children = [item];
        }
      };

      for (const heading of headings) {
        const id = getOrCreateId(heading);
        const item: Item = {
          key: id,
          level: LEVEL_MAP[heading.tagName],
          title: heading.textContent,
          href: `#${id}`,
        };

        let parent: Item | undefined = stack[stack.length - 1];

        if (parent == null) {
          // 新的栈
          roots.push(item);
        } else if (item.level > parent.level) {
          // 属于子级
          appendChild(parent, item);
        } else {
          // 弹出栈
          do {
            stack.pop();
          } while ((parent = stack[stack.length - 1]) && parent.level >= item.level);

          if (!stack.length) {
            // 新元素
            roots.push(item);
          } else if (parent) {
            appendChild(parent, item);
          }
        }

        stack.push(item);
      }

      setTree(roots);
    });

    const mutationObserver = new MutationObserver(records => {
      for (const record of records) {
        if (
          record.type === 'childList' &&
          (Array.from(record.addedNodes).some(isHeading) || Array.from(record.removedNodes).some(isHeading))
        ) {
          update();
          break;
        }
      }
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    update();

    return () => {
      mutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setSnapshot(i => i + 1);
  }, [tree]);

  return (
    <div className={s.root} ref={element}>
      <Anchor key={snapshot} items={tree} />
    </div>
  );
};
