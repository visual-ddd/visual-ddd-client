import { useEditorFormContext, useEditorModel } from '@/lib/editor';
import { MapperEditorModel } from '../../model';

/**
 * 获取 mapper 模型
 * @returns
 */
export function useMapper() {
  const { model } = useEditorModel<MapperEditorModel>();
  const { formModel } = useEditorFormContext()!;

  return model.mapperStore.getMapperById(formModel.id)!;
}
