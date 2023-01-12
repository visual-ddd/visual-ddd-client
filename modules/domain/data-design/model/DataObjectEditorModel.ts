import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { DataObjectEvent } from './DataObjectEvent';
import { DataObjectStore } from './DataObjectStore';
import { DataObjectValidateManager } from './DataObjectValidateManager';

/**
 * 数据建模编辑器模型
 */
export class DataObjectEditorModel extends BaseEditorModel {
  dataObjectStore: DataObjectStore;
  protected dataObjectEvent: DataObjectEvent;
  protected validateManager: DataObjectValidateManager;

  constructor(options: BaseEditorModelOptions) {
    super(options);

    this.dataObjectEvent = new DataObjectEvent();
    this.dataObjectStore = new DataObjectStore({
      event: this.event,
      dataObjectEvent: this.dataObjectEvent,
      editorModel: this,
    });
    this.validateManager = new DataObjectValidateManager({
      event: this.event,
      dataObjectEvent: this.dataObjectEvent,
      editorModel: this,
      store: this.dataObjectStore,
    });

    // @ts-expect-error
    globalThis.__DATA_OBJECT_EDITOR_MODEL__ = this;
  }
}
