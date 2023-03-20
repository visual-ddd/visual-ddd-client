import { FullscreenOutlined } from '@ant-design/icons';
import { useRefValue } from '@wakeapp/hooks';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import s from './index.module.scss';

export interface FullScreenContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  onFullScreenChange?: (fullscreen: boolean) => void;
}

export const FullScreenContainer = (props: FullScreenContainerProps) => {
  const { className, children, onFullScreenChange } = props;
  const elRef = useRef<HTMLDivElement>(null);
  const onFullScreenChangeRef = useRefValue(onFullScreenChange);

  const handleFullscreen = async () => {
    const el = elRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  };

  useEffect(() => {
    const el = elRef.current;

    if (!el) {
      return;
    }

    const listener = () => {
      const isFullscreen = document.fullscreenElement === el;

      onFullScreenChangeRef.current?.(isFullscreen);
    };

    el.addEventListener('fullscreenchange', listener);

    return () => {
      el.removeEventListener('fullscreenchange', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classNames(className, s.root)} ref={elRef}>
      {children}
      <div className={s.icon} title="全屏" onClick={handleFullscreen}>
        <FullscreenOutlined />
      </div>
    </div>
  );
};
