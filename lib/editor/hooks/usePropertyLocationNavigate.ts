import { useEditorModel, EditorPropertyLocation } from '../Model';

/**
 * 属性定位/跳转
 */
export function usePropertyLocationNavigate() {
  const { model } = useEditorModel();

  return function open(params: EditorPropertyLocation) {
    return model.propertyLocationObserver.emit(params);
  };
}
