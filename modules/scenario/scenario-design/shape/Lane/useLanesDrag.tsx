import { useEffect, useRef } from 'react';

import s from './LaneShape.module.scss';

/**
 * 整体泳道只能横向扩展
 */
export function useLanesDrag(options: {
  direction: 'horizontal' | 'vertical';
  min: number | (() => number);
  update: (value: number) => void;
}) {
  const instanceRef = useRef<HTMLDivElement>(null);
  const disposer = useRef<Function>();

  const handleStart = (evt: React.MouseEvent) => {
    if (disposer.current != null) {
      disposer.current();
      disposer.current = undefined;
    }

    evt.stopPropagation();
    evt.preventDefault();

    const getValueFromEvent = (e: MouseEvent) => {
      return options.direction === 'vertical' ? e.pageX : e.pageY;
    };

    const instance = instanceRef.current!;

    let start = getValueFromEvent(evt.nativeEvent);
    let disposed = false;
    let dragging = false;
    let ghost: HTMLElement | null = null;

    const height = instance.offsetHeight;
    const width = instance.offsetWidth;
    const min = typeof options.min === 'function' ? options.min() : options.min;

    const relativeValue = options.direction === 'vertical' ? width : height;

    console.log('down');

    const handleMove = (evt: MouseEvent) => {
      if (!dragging) {
        ghost = document.createElement('div');
        ghost.className = s.ghost;
        ghost.style.height = `${height}px`;
        ghost.style.width = `${width}px`;
        instance.appendChild(ghost);
      }

      dragging = true;
      const delta = getValueFromEvent(evt) - start;
      const newValue = Math.max(relativeValue + delta, min);

      if (options.direction === 'vertical') {
        ghost!.style.width = `${newValue}px`;
      } else {
        ghost!.style.height = `${newValue}px`;
      }
    };

    const dispose = () => {
      if (disposed) {
        return;
      }

      disposed = true;

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('mouseleave', handleEnd);

      if (ghost) {
        ghost.remove();
      }
    };

    const handleEnd = (evt: MouseEvent) => {
      if (disposed) {
        return;
      }

      if (ghost) {
        const delta = getValueFromEvent(evt) - start;
        const newValue = Math.max(relativeValue + delta, min);
        if (newValue !== relativeValue) {
          // 触发修改
          options.update(newValue);
        }
      }

      dispose();
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('mouseleave', handleEnd);
    disposer.current = dispose;
  };

  useEffect(() => {
    disposer.current?.();
  }, []);

  return { instanceRef, handleStart };
}
