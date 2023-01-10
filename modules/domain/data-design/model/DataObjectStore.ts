import { BaseEditorEvent, BaseEditorModel, tryDispose } from '@/lib/editor';
import { derive, makeAutoBindThis, mutation } from '@/lib/store';
import { debounce } from '@wakeapp/utils';
import { makeObservable, observable } from 'mobx';

import { DataObject } from './DataObject';

export class DataObjectStore {
  protected event: BaseEditorEvent;
  protected editorModel: BaseEditorModel;

  /**
   * 所有对象
   */
  @observable.shallow
  protected objects: Map<string, DataObject> = new Map();

  /**
   * 即将移除的对象
   */
  protected objectsWillRemoved: Map<string, DataObject> = new Map();

  /**
   * 对象列表
   */
  @derive
  get objectsInArray() {
    return Array.from(this.objects.values());
  }

  constructor(inject: { event: BaseEditorEvent; editorModel: BaseEditorModel }) {
    const { event, editorModel } = inject;

    this.event = event;
    this.editorModel = editorModel;

    this.event.on('NODE_CREATED', ({ node }) => {
      const object = new DataObject({ node, store: this });
      const current = this.objects.get(node.id);

      this.objects.set(node.id, object);

      if (current) {
        tryDispose(current);
      }
    });

    this.event.on('NODE_REMOVED', ({ node }) => {
      const obj = this.objects.get(node.id);

      if (obj) {
        const willRemove = this.objectsWillRemoved.get(obj.id);
        this.objectsWillRemoved.set(obj.id, obj);
        this.objects.delete(obj.id);

        if (willRemove) {
          tryDispose(willRemove);
        }

        this.gc();
      }
    });

    makeObservable(this);
    makeAutoBindThis(this);
  }

  /**
   * 根据 ID 获取对象
   * @param id
   * @returns
   */
  getObjectById(id?: string) {
    if (id == null) {
      return undefined;
    }

    return this.objects.get(id) || this.objectsWillRemoved.get(id);
  }

  @mutation('DO_STORE:GC', false)
  private removeWillRemoved() {
    this.objectsWillRemoved.clear();
  }

  private gc = debounce(() => {
    this.objectsWillRemoved.forEach(i => tryDispose(i));
    this.removeWillRemoved();
  }, 2000);
}
