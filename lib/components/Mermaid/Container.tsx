import classNames from 'classnames';
import panzoom from 'panzoom';
import { useEffect, useRef } from 'react';
import s from './Container.module.scss';

export const MermaidContainer = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, children, ...other } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const instance = panzoom(ref.current!);

    return () => {
      instance.dispose();
    };
  }, []);

  return (
    <div className={classNames(s.root, className)} {...other}>
      <div ref={ref}>{children}</div>
    </div>
  );
};
