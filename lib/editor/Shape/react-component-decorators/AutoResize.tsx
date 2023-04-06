/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from 'react';
import { ReactDecorator } from '@/lib/g6-binding';
import { debounce } from '@wakeapp/utils';

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
    const { node } = props;
    if (node.data.__prevent_auto_resize__) {
      return <Input {...props} />;
    }

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!containerRef.current) {
        return;
      }

      const update = ({ width, height }: { width: number; height: number }) => {
        // resize 有一定几率会报 width 和 height 为 0 的错误
        if (!width && !height) {
          return;
        }

        const size = props.node.getSize();
        if (size.width !== width || size.height !== height) {
          props.node.resize(width, height, { autoResize: true });
        }
      };

      const listener = debounce(
        (entries: ResizeObserverEntry[]) => {
          for (const entry of entries) {
            update({ width: entry.contentRect.width, height: entry.contentRect.height });
          }
        },
        100,
        { leading: true }
      );

      const observer = new ResizeObserver(listener);

      observer.observe(containerRef.current);

      return () => {
        listener.cancel();
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
