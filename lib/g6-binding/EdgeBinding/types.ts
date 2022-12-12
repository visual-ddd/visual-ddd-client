import { Edge } from '@antv/x6';
import { CellBindingProps } from '../CellBinding';

export interface EdgeBindingProps extends CellBindingProps {
  /**
   * 来源节点
   */
  source?: Edge.Metadata['source'];

  /**
   * 目标节点
   */
  target?: Edge.Metadata['target'];

  /**
   * 路径点。
   */
  vertices?: Edge.BaseOptions['vertices'];

  /**
   * 路由
   */
  router?: Edge.BaseOptions['router'];

  /**
   * 连线
   */
  connector?: Edge.BaseOptions['connector'];

  /**
   * 标签
   */
  labels?: Edge.BaseOptions['labels'];

  /**
   * 默认标签
   */
  defaultLabel?: Edge.BaseOptions['defaultLabel'];

  /**
   * 简写标签
   */
  label?: string;
}
