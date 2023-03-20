import classNames from 'classnames';
import panzoom from 'panzoom';
import { useEffect, useRef } from 'react';

import { FullScreenContainer } from '../FullScreenContainer';

import s from './Container.module.scss';

export const MermaidContainer = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, children, ...other } = props;
  const ref = useRef<HTMLDivElement>(null);
  const panzoomRef = useRef<ReturnType<typeof panzoom>>();

  useEffect(() => {
    const instance = panzoom(ref.current!, { autocenter: true, minZoom: 0.5, maxZoom: 2 });

    panzoomRef.current = instance;

    return () => {
      instance.dispose();
    };
  }, []);

  const handleFullScreenChange = (fullscreen: boolean) => {
    panzoomRef.current?.zoomAbs(0, 0, 1);
    panzoomRef.current?.moveTo(0, 0);
  };

  return (
    <FullScreenContainer
      className={classNames(s.root, className)}
      onFullScreenChange={handleFullScreenChange}
      {...other}
    >
      <div ref={ref}>{children}</div>
    </FullScreenContainer>
  );
};
