import type { Edge } from '@antv/x6';
import s from './shared.module.scss';

const CIRCLE = {
  magnet: true,
  r: 6,
  stroke: 'var(--vd-color-primary)',
  strokeWidth: 2,
  class: s.port,
};

export const PORTS = {
  ports: {
    groups: {
      left: {
        position: 'left',
        attrs: {
          circle: CIRCLE,
        },
      },
      right: {
        position: 'right',
        label: {
          position: 'right',
        },
        attrs: { circle: CIRCLE },
      },
    },
    items: [
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
};

const EdgeConnector: Edge.BaseOptions['connector'] = { name: 'rounded' };

const EdgeRouter: Edge.BaseOptions['router'] = {
  name: 'manhattan',
  args: {
    step: 10,
  },
};
const EdgeAttrs: Edge.BaseOptions['attrs'] = {
  line: {
    stroke: 'gray',
    targetMarker: {
      name: 'block',
      args: { offset: -5 },
    },
  },
};

export const EDGE_PROPS = {
  connector: EdgeConnector,
  router: EdgeRouter,
  attrs: EdgeAttrs,
};
