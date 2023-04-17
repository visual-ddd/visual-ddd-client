import { NoopArray } from '@wakeapp/utils';
import { Prompt } from '../types';
import s from './Card.module.scss';
import { CloseCircleOutlined, PlusSquareFilled } from '@ant-design/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getFrontColor } from '@/lib/utils';
import classNames from 'classnames';
import { createPortal } from 'react-dom';
import { Markdown } from '@/lib/components/Markdown';

export interface CardProps {
  item: Prompt;
  onImport?: (item: Prompt) => void;
}

const COLORS = ['#4776B5', '#2E4D75', '#60A1F6', '#152336', '#568FDB'];

const useColor = (item: Prompt) => {
  // 根据名称获取颜色
  const color = useMemo(() => {
    return COLORS[item.name.charCodeAt(0) % COLORS.length];
  }, [item.name]);

  const frontColor = useMemo(() => {
    const front = getFrontColor(color);

    return {
      main: front === 'white' ? 'white' : 'black',
      secondary: front === 'white' ? 'var(--vd-color-gray-100)' : 'var(--vd-color-gray-900)',
      placeholder: front === 'white' ? 'var(--vd-color-gray-400)' : 'var(--vd-color-gray-800)',
    };
  }, [color]);

  return { color, frontColor };
};

interface DetailProps extends CardProps {
  relative: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}

const Detail = (props: DetailProps) => {
  const { item, relative, onClose, onImport } = props;
  const { color, frontColor } = useColor(item);
  const portal = document.getElementById('prompt-library')!;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImport = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();

    onImport?.(item);
  };

  useEffect(() => {
    const target = containerRef.current;
    const parent = relative.current;
    if (!parent || !target) {
      return;
    }

    const portalBBox = portal.getBoundingClientRect();
    const parentBBox = parent.getBoundingClientRect();

    const x = parentBBox.left - portalBBox.left;
    const y = parentBBox.top - portalBBox.top;

    target.style.setProperty('--width', `${parent.offsetWidth}px`);
    target.style.setProperty('--height', `${parent.offsetHeight}px`);
    target.style.setProperty('--top', `${y}px`);
    target.style.setProperty('--left', `${x}px`);

    const handle = requestAnimationFrame(() => {
      target.classList.add(s.visible);
    });

    return () => {
      cancelAnimationFrame(handle);
    };
  }, [relative, portal]);

  const handleHide = () => {
    containerRef.current?.classList.remove(s.visible);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return createPortal(
    <div>
      <div
        className={classNames(s.root, s.detail)}
        ref={containerRef}
        style={{
          // @ts-expect-error
          '--color': color,
          '--front-main-color': frontColor.main,
          '--front-secondary-color': frontColor.secondary,
          '--front-placeholder-color': frontColor.placeholder,
        }}
      >
        <CloseCircleOutlined className={s.close} onClick={handleHide} />
        <div className={s.category}>{(item.category ?? NoopArray).join(',') || '未分类'}</div>
        <div className={s.name}>{item.name}</div>
        <div className={s.promptBody}>
          {item.description && (
            <div className={s.description}>
              <h3>描述</h3>
              {item.description}
            </div>
          )}
          {item.introduction && (
            <div className={s.introduction}>
              <h3>详情</h3>
              <Markdown
                content={item.introduction}
                className={frontColor.main === 'white' ? 'dark' : 'light'}
              ></Markdown>
            </div>
          )}
          <div className={s.prompt}>
            <h3>提示语</h3>
            {item.system}
          </div>
        </div>
        <div className={s.footer}>
          <div className={s.author}>
            {item.author} {item.date}
          </div>
          <PlusSquareFilled className={s.add} title="添加到会话" onClick={handleImport} />
        </div>
      </div>
      <div className={s.mask} onClick={handleHide}></div>
    </div>,
    portal
  );
};

export const Card = (props: CardProps) => {
  const { item, onImport } = props;
  const { color, frontColor } = useColor(item);
  const [showDetail, setShowDetail] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImport = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();

    onImport?.(item);
  };

  return (
    <div
      className={classNames(s.root, s.card, { [s.detailVisible]: showDetail })}
      onClick={() => setShowDetail(true)}
      ref={containerRef}
      style={{
        // @ts-expect-error
        '--color': color,
        '--front-main-color': frontColor.main,
        '--front-secondary-color': frontColor.secondary,
        '--front-placeholder-color': frontColor.placeholder,
      }}
    >
      <div className={s.category}>{(item.category ?? NoopArray).join(',') || '未分类'}</div>
      <div className={s.name}>{item.name}</div>
      <div className={s.introduce}>{item.description || item.system}</div>
      <div className={s.footer}>
        <div className={s.author}>{item.author}</div>
        <PlusSquareFilled className={s.add} title="添加到会话" onClick={handleImport} />
      </div>
      {showDetail && (
        <Detail onClose={() => setShowDetail(false)} relative={containerRef} item={item} onImport={onImport} />
      )}
    </div>
  );
};
