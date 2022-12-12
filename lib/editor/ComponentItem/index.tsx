import classNames from 'classnames';
import Image from 'next/image';
import React, { memo } from 'react';
import { ALLOWED_DROP_SOURCE } from '@/lib/g6-binding';

import defaultIcon from './default-logo.svg';
import s from './index.module.scss';

export interface ComponentItemProps {
  icon?: string;
  name: string;
  data: Record<string, any>;
}

export const ComponentItem = memo((props: ComponentItemProps) => {
  const handleDrag = (evt: React.DragEvent) => {
    evt.dataTransfer.setData('text/plain', `${ALLOWED_DROP_SOURCE}${JSON.stringify(props.data)}`);
    evt.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={classNames('vd-editor-component', s.root)} draggable onDragStart={handleDrag}>
      <div className={classNames('vd-editor-component__icon', s.icon)}>
        <Image draggable="false" src={props.icon ?? defaultIcon} alt={props.name} />
      </div>
      <div className={classNames('vd-editor-component__name', s.name)}>{props.name}</div>
    </div>
  );
});

ComponentItem.displayName = 'ComponentItem';
