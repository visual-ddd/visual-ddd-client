import classNames from 'classnames';
import Image, { StaticImageData } from 'next/image';
import React, { memo } from 'react';
import { ALLOWED_DROP_SOURCE } from '@/lib/g6-binding';

import defaultIcon from './default-logo.svg';
import s from './index.module.scss';

export interface ShapeItemProps {
  icon?: string | StaticImageData;
  name: string;
  type: string;
}

export const ShapeItem = memo((props: ShapeItemProps) => {
  const handleDrag = (evt: React.DragEvent) => {
    evt.dataTransfer.setData('text/plain', `${ALLOWED_DROP_SOURCE}${JSON.stringify({ type: props.type })}`);
    evt.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={classNames('vd-editor-shape-item', s.root)} draggable onDragStart={handleDrag}>
      <div className={classNames('vd-editor-shape-item__icon', s.icon)}>
        <Image draggable="false" src={props.icon ?? defaultIcon} alt={props.name} />
      </div>
      <div className={classNames('vd-editor-shape-item__name', s.name)}>{props.name}</div>
    </div>
  );
});

ShapeItem.displayName = 'ShapeItem';
