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
   * 连接桩
   *
   * @note 这个属性是静态的，只有初始挂载时有效
   */
  ports?: Node.Metadata['ports'];

  /**
   * 链接桩的 DOM 结构。当 ports.groups 和 ports.items 都没有为对应的链接桩指定 markup 时，则使用这个默认选项来渲染链接桩
   *
   * @note 这个属性是静态的，只有初始挂载时有效
   */
  portMarkup?: Node.Metadata['portMarkup'];

  /**
   * 链接桩标签的 DOM 结构。当 ports.groups 和 ports.items 都没有为对应的链接桩标签指定 markup 时，则使用这个默认选项来渲染链接桩标签
   * @note 这个属性是静态的，只有初始挂载时有效
   */
  portLabelMarkup?: Node.Metadata['portLabelMarkup'];

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
