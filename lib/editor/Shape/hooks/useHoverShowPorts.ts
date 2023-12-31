import { CellBindingProps } from '@/lib/g6-binding';
import { useCanvasModel } from '../../Canvas';

const setPortVisible = (cellId: string, visible: boolean) => {
  const cell = document.querySelector('[data-cell-id="' + cellId + '"]') as SVGGElement;

  if (cell) {
    cell.setAttribute('data-port-visible', String(!!visible));

    return true;
  }

  return false;
};

/**
 * 在 Hover 时显示 port
 * TODO: 放到 CanvasModel 中全局实现
 *
 * X6 目前并没有提供响应的接口
 */
export function useHoverShowPorts() {
  const { model: canvasModel } = useCanvasModel();

  const handleMouseEnter: CellBindingProps['onMouseenter'] = evt => {
    const cell = evt.cell;

    const registry = canvasModel.shapeRegistry;

    if (registry.isAllowMagnetCreateEdge({ cell })) {
      setPortVisible(evt.cell.id, true);
    }
  };

  const handleMouseLeave: CellBindingProps['onMouseleave'] = evt => {
    setPortVisible(evt.cell.id, false);
  };

  // 高亮时也展示ports
  const handleHighligh: CellBindingProps['onHighlight'] = evt => {
    setPortVisible(evt.cell.id, true);
  };

  const handleUnhighlight: CellBindingProps['onUnhighlight'] = evt => {
    setPortVisible(evt.cell.id, false);
  };

  return {
    onMouseenter: handleMouseEnter,
    onMouseleave: handleMouseLeave,
    onHighlight: handleHighligh,
    onUnhighlight: handleUnhighlight,
  };
}
