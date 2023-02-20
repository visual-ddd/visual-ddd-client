import { createNameDSL } from '@/modules/domain/domain-design/dsl';
import { v4 } from 'uuid';
import { DEFAULT_LANE_HEIGHT, DEFAULT_LANE_WIDTH } from './constants';
import { LaneDSL, LanesDSL } from './dsl';

export function createLaneDSL(): LaneDSL {
  return {
    uuid: v4(),
    title: '未命名泳道',
    height: DEFAULT_LANE_HEIGHT,
  };
}

export function createLanesDSL(): LanesDSL {
  return {
    ...createNameDSL({ wordCase: 'CamelCase', title: false }),
    width: DEFAULT_LANE_WIDTH,
    panes: [createLaneDSL()],
  };
}
