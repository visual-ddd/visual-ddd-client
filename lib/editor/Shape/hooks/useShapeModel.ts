import { Cell } from '@antv/x6';
import { useMemo } from 'react';
import { useEditorModel } from '../../Model';

/**
 * 获取节点模型
 */
export function useShapeModel(cell: Cell) {
  const editorModel = useEditorModel();

  const model = useMemo(() => {
    return editorModel.index.getNodeById(cell.id)!;
  }, [cell.id, editorModel.index]);

  return {
    /**
     * 模型对象
     */
    model,

    /**
     * 获取属性
     */
    properties: model.properties,

    /**
     * 更新属性
     * @param path
     * @param value
     * @param debounce
     */
    updateProperty(path: string, value: any, debounce?: boolean) {
      if (debounce) {
        editorModel.commandHandler.updateNodePropertyDebounced({ node: model, path, value });
      } else {
        editorModel.commandHandler.updateNodeProperty({ node: model, path, value });
      }
    },
  };
}
