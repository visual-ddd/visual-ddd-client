import { Cell } from '@antv/x6';
import { BaseNodeProperties, useEditorModel } from '../../Model';

/**
 * 获取节点模型
 * 只能在 React Shape 组件里面使用
 */
export function useShapeModel<T extends {} = BaseNodeProperties>(cell: Cell) {
  const { index, formStore, commandHandler, model: editorModel } = useEditorModel();

  const model = index.getNodeById(cell.id);
  const formModel = formStore.getFormModel(cell.id);

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
    properties: model?.properties as T | undefined,

    /**
     * 编辑器模型
     */
    editorModel,

    /**
     * 更新属性
     * @param path
     * @param value
     * @param debounce
     */
    updateProperty(path: string, value: any, debounce?: boolean) {
      if (!model) {
        return;
      }

      if (debounce) {
        commandHandler.updateNodePropertyDebounced({ node: model, path, value });
      } else {
        commandHandler.updateNodeProperty({ node: model, path, value });
      }
    },
  };
}
