import { Cell, CellView } from '@antv/x6';

export interface CellBindingProps {
  /**
   * id 是节点/边的唯一标识，推荐使用具备业务意义的 ID，默认使用自动生成的 UUID
   */
  id?: string;

  /**
   * attrs 选项是一个复杂对象，该对象的 Key 是节点中 SVG 元素的选择器(Selector)，对应的值是应用到该 SVG 元素的 SVG 属性值
   */
  attrs?: Cell.Metadata['attrs'];

  /**
   * 形状
   */
  shape?: Cell.Metadata['shape'];

  /**
   * 节点/边在画布中的层级，默认根据节点/边添加顺序自动确定。
   */
  zIndex?: Cell.Metadata['zIndex'];

  /**
   * 节点/边是否可见。
   */
  visible?: boolean;

  /**
   * 与节点/边关联的业务数据。例如，我们在实际使用时通常会将某些业务数据存在节点/边的 data 上
   */
  data?: Cell.Metadata['data'];

  /**
   * 是否支持作为分组, 默认 true
   */
  canBeParent?: boolean;

  children?: React.ReactNode;

  onCellReady?: (cell: Cell) => void;

  onClick?: (evt: CellView.EventArgs['cell:click']) => void;
  onDblclick?: (evt: CellView.EventArgs['cell:dblclick']) => void;
  onContextmenu?: (evt: CellView.EventArgs['cell:contextmenu']) => void;
  onMousedown?: (evt: CellView.EventArgs['cell:mousemove']) => void;
  onMousemove?: (evt: CellView.EventArgs['cell:mousedown']) => void;
  onMouseup?: (evt: CellView.EventArgs['cell:mouseup']) => void;
  onMouseover?: (evt: CellView.EventArgs['cell:mouseover']) => void;
  onMouseout?: (evt: CellView.EventArgs['cell:mouseout']) => void;
  onMouseenter?: (evt: CellView.EventArgs['cell:mouseenter']) => void;
  onMouseleave?: (evt: CellView.EventArgs['cell:mouseleave']) => void;
  onMousewheel?: (evt: CellView.EventArgs['cell:mousewheel']) => void;
  onHighlight?: (evt: CellView.EventArgs['cell:highlight']) => void;
  onUnhighlight?: (evt: CellView.EventArgs['cell:unhighlight']) => void;
}

export interface CellContextValue {
  /**
   * 添加子节点
   * @param cell
   */
  addChild(cell: Cell): () => void;
}
