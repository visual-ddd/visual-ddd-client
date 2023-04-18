import { useUid } from '@wakeapp/hooks';
import classNames from 'classnames';
import Mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

Mermaid.initialize({ startOnLoad: false, darkMode: true, theme: 'neutral', securityLevel: 'loose' });

export interface MermaidProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
}

async function isValid(code: string) {
  try {
    await Mermaid.parse(code);

    return true;
  } catch {
    return false;
  }
}

export const MermaidComponent = (props: MermaidProps) => {
  const { code, className, ...rest } = props;
  const ref = useRef<HTMLDivElement>(null);
  const id = useUid('mermaid');

  const render = async (data: string) => {
    const valid = await isValid(data);

    if (!valid) {
      return;
    }

    try {
      const { svg } = await Mermaid.render(id, data);

      if (ref.current) {
        ref.current.innerHTML = svg;
      }
    } catch (err) {
      console.error('mermaid error', err, data);
    }
  };

  useEffect(() => {
    render(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return <div ref={ref} className={classNames('mermaid', className)} {...rest} />;
};
