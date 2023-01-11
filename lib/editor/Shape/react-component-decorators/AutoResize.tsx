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

      const update = debounce(
        ({ width, height }: { width: number; height: number }) => {
          props.node.resize(width, height, { autoResize: true });
        },
        100,
        { leading: true }
      );

      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          update({ width: entry.contentRect.width, height: entry.contentRect.height });
        }
      });

      observer.observe(containerRef.current);

      return () => {
        update.cancel();
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
