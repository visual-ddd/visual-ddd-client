import type { IDDSL, NameDSL } from '@/modules/domain/domain-design/dsl';

export interface LaneDSL extends IDDSL {
  title: string;
  height: number;
}

export interface LanesDSL extends NameDSL {
  width: number;

  /**
   * 泳道列表
   */
  panes: LaneDSL[];
}
