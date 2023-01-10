import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { DataObjectStore } from './DataObjectStore';

/**
 * 数据建模编辑器模型
 */
export class DataObjectEditorModel extends BaseEditorModel {
  dataObjectStore: DataObjectStore;

  constructor(options: BaseEditorModelOptions) {
    super(options);

    this.dataObjectStore = new DataObjectStore({ event: this.event, editorModel: this });
  }
}
