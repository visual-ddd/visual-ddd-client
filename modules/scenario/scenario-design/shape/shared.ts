import type { Edge } from '@antv/x6';
import type { PortManager } from '@antv/x6/lib/model/port';
import s from './shared.module.scss';

const CIRCLE = {
  magnet: true,
  r: 6,
  stroke: 'var(--vd-color-primary)',
  strokeWidth: 2,
  class: s.port,
};

export const PORTS: { ports: PortManager.Metadata } = {
  ports: {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: CIRCLE,
        },
      },
      left: {
        position: 'left',
        attrs: {
          circle: CIRCLE,
        },
      },
      right: {
        position: 'right',
        attrs: { circle: CIRCLE },
      },
      bottom: {
        position: 'bottom',
        attrs: { circle: CIRCLE },
      },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
      { id: 'bottom', group: 'bottom' },
    ],
  },
};

const EdgeConnector: Edge.BaseOptions['connector'] = { name: 'rounded' };

const EdgeRouter: Edge.BaseOptions['router'] = {
  name: 'er',
  args: {
    offset: 'center',
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
