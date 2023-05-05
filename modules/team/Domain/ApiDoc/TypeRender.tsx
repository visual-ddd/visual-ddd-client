import classNames from 'classnames';
import { cloneElement, memo } from 'react';
import { parseType } from './extra-api';

import s from './TypeRender.module.scss';

export interface TypeRenderProps {
  type: string;
}

/**
 * 类型渲染
 */
export const TypeRender = memo((props: TypeRenderProps) => {
  return (
    <span className={classNames(s.root)}>
      {parseType(props.type, (name, id) => {
        return (
          <a className="u-link" href={`#ref-${id}`}>
            {name}
          </a>
        );
      }).map((i, idx) => {
        return typeof i === 'string' ? <span key={idx}>{i}</span> : cloneElement(i, { key: idx });
      })}
    </span>
  );
});

TypeRender.displayName = 'TypeRender';
