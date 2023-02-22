import { createNameDSL } from '@/modules/domain/domain-design/dsl';
import { v4 } from 'uuid';
import { DEFAULT_LANE_HEIGHT, DEFAULT_LANE_WIDTH } from './constants';
import { ActivityDSL, CommentDSL, LabelEdgeDSL, LaneDSL, LanesDSL } from './dsl';

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

export function createLabelEdge(): LabelEdgeDSL {
  return {
    uuid: v4(),
    label: '标签',
  };
}

export function createCommentDSL(): CommentDSL {
  return {
    uuid: v4(),
    content: '注释内容',
  };
}

/**
 * 业务活动
 * @returns
 */
export function createActivityDSL(): ActivityDSL {
  const nameDSL = createNameDSL();

  return {
    ...nameDSL,
    title: '业务活动',
    // 自动生成
    name: `activity${nameDSL.uuid.slice(-4)}${String(Date.now()).slice(-4)}`,
    binding: undefined,
  };
}
