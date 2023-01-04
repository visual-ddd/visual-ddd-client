import { Cell } from '@antv/x6';
import { useMemo } from 'react';

import { CanvasModel } from '../../Canvas';

/**
 * 获取节点模型
 * 只能在 React Shape 组件里面使用
 */
export function useShapeModel(cell: Cell) {
  const canvasModel = useMemo(() => {
    return CanvasModel.getModel(cell.model!.graph)!;
  }, [cell]);
  const { index, formStore, commandHandler } = canvasModel.editorModel;

  const [model, formModel] = useMemo(() => {
    const model = index.getNodeById(cell.id)!;
    const formModel = formStore.getFormModel(cell.id)!;

    return [model, formModel];
  }, [cell.id, index, formStore]);

  return {
    /**
     * 模型对象
     */
    model,

    /**
     * 表单模型对象
     */
    formModel,

    /**
     * 获取属性
     */
    properties: model?.properties,

    /**
     * 更新属性
     * @param path
     * @param value
     * @param debounce
     */
    updateProperty(path: string, value: any, debounce?: boolean) {
      if (debounce) {
        commandHandler.updateNodePropertyDebounced({ node: model, path, value });
      } else {
        commandHandler.updateNodeProperty({ node: model, path, value });
      }
    },
  };
}
