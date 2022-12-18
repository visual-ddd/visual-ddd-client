/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from 'react';
import { ReactDecorator } from '@/lib/g6-binding';
import { wrapPreventListenerOptions } from '@/lib/g6-binding/hooks';

const STYLE: React.CSSProperties = {
  position: 'absolute',
};

/**
 * 自动根据内容调整 X6 图形的大小
 * @param Input
 * @returns
 */
export const AutoResizeDecorator: ReactDecorator = Input => {
  // eslint-disable-next-line react/display-name
  return props => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!containerRef.current) {
        return;
      }

      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          props.node.resize(entry.contentRect.width, entry.contentRect.height, wrapPreventListenerOptions({}));
        }
      });

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <div className="vd-auto-resize-container" style={STYLE} ref={containerRef}>
        <Input {...props} />
      </div>
    );
  };
};
