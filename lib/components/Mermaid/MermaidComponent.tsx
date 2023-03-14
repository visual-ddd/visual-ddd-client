import classNames from 'classnames';
import Mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

Mermaid.initialize({ startOnLoad: false, darkMode: true, theme: 'neutral', securityLevel: 'loose' });

export interface MermaidProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
}

export const MermaidComponent = (props: MermaidProps) => {
  const { code, className, ...rest } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Mermaid.render('graph', code).then(({ svg }) => {
      if (ref.current) {
        ref.current.innerHTML = svg;
      }
    });
  }, [code]);

  return <div ref={ref} className={classNames('mermaid', className)} {...rest} />;
};
