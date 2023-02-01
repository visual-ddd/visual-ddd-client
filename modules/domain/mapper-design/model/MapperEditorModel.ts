import { BaseEditorModel, BaseEditorModelOptions } from '@/lib/editor';
import { MapperStore, IObjectStore } from './MapperStore';

export interface MapperEditorModelOptions extends BaseEditorModelOptions {
  objectStore: IObjectStore;
}

export class MapperEditorModel extends BaseEditorModel {
  mapperStore: MapperStore;

  constructor(options: MapperEditorModelOptions) {
    super(options);

    this.mapperStore = new MapperStore({ event: this.event, objectStore: options.objectStore });
  }
}
