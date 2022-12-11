import { Node } from '@antv/x6';
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
}
