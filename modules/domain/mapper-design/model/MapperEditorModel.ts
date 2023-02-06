import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { MapperStore, IObjectStore } from './MapperStore';
import { MapperValidateManager } from './MapperValidateManager';

export interface MapperEditorModelOptions extends BaseEditorModelOptions {
  objectStore: IObjectStore;
}

export class MapperEditorModel extends BaseEditorModel {
  mapperStore: MapperStore;
  validateManager: MapperValidateManager;

  constructor(options: MapperEditorModelOptions) {
    super(options);

    this.mapperStore = new MapperStore({
      event: this.event,
      objectStore: options.objectStore,
      commandHandler: this.commandHandler,
    });
    this.validateManager = new MapperValidateManager({
      editorModel: this,
      event: this.event,
      store: this.mapperStore,
    });
  }
}
