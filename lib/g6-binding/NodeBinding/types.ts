import { Node, CellView } from '@antv/x6';
import { CellBindingProps } from '../CellBinding/types';

export interface NodeBindingProps extends CellBindingProps {
  /**
   * 尺寸
   */
  size?: Node.Metadata['size'];

  /**
   * 定位
   */
  position?: Node.Metadata['position'];

  /**
   * 旋转角度
   */
  angle?: number;

  /**
   * 开启嵌入，在开始拖动节点时触发
   * @param evt
   * @returns
   */
  onEmbed?: (evt: CellView.EventArgs['node:embed']) => void;

  /**
   * 寻找目标节点过程中触发
   * @param evt
   * @returns
   */
  onEmbedding?: (evt: CellView.EventArgs['node:embedding']) => void;

  /**
   * 完成节点嵌入后触发
   */
  onEmbedded?: (evt: CellView.EventArgs['node:embedded']) => void;
}
