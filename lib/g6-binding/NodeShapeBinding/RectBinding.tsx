import { Shape } from '@antv/x6';

import { NodeBindingProps } from '../NodeBinding';

import { createShape } from './createShape';

export const RectBinding = createShape<NodeBindingProps & { label?: string }>(
  Shape.Rect,
  [{ name: 'label', getter: 'getLabel', setter: 'setLabel', remover: 'removeLabel' }],
  'RectBinding'
);
