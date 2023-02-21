export enum ScenarioObjectName {
  /**
   * 泳道
   */
  Lane = 's-lane',

  /**
   * 起始节点
   */
  Start = 's-start',

  /**
   * 结束节点
   */
  End = 's-end',

  /**
   * 活动节点
   */
  Activity = 's-activity',

  /**
   * 决策节点
   */
  Decision = 's-decision',

  /**
   * 注释节点
   */
  Comment = 's-comment',

  /**
   * 普通边
   */
  NormalEdge = 's-edge',

  /**
   * 注释边
   */
  CommentEdge = 's-comment-edge',

  /**
   * 标签边
   */
  LabelEdge = 's-label-edge',
}

export const DEFAULT_LANE_WIDTH = 1000;
export const DEFAULT_LANE_HEIGHT = 300;
