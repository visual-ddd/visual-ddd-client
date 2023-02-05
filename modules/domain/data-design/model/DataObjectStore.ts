import { BaseEditorEvent, BaseEditorModel, BaseNode, tryDispose } from '@/lib/editor';
import { command, derive, makeAutoBindThis } from '@/lib/store';
import { debounce } from '@wakeapp/utils';
import { makeObservable, observable } from 'mobx';
import { DataObjectName, DataObjectReferenceCardinalityReversed } from '../dsl';

import { DataObject, DataObjectEdgeDeclaration } from './DataObject';
import { DataObjectEvent } from './DataObjectEvent';

export class DataObjectStore {
  protected event: BaseEditorEvent;
  protected editorModel: BaseEditorModel;
  protected dataObjectEvent: DataObjectEvent;

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

  /**
   * 关系边
   */
  @derive
  get edges(): DataObjectEdgeDeclaration[] {
    const map: Map<string, DataObjectEdgeDeclaration> = new Map();

    for (const obj of this.objectsInArray) {
      const edges = obj.edges;
      for (const edge of edges) {
        if (map.has(edge.id)) {
          continue;
        }

        if (map.has(edge.reverseId)) {
          const item = map.get(edge.reverseId)!;
          if (item.type == null && edge.type != null) {
            item.type = DataObjectReferenceCardinalityReversed[edge.type];
          }
          continue;
        }

        map.set(edge.id, edge);
      }
    }

    return Array.from(map.values());
  }

  constructor(inject: { event: BaseEditorEvent; dataObjectEvent: DataObjectEvent; editorModel: BaseEditorModel }) {
    const { event, dataObjectEvent, editorModel } = inject;

    this.event = event;
    this.dataObjectEvent = dataObjectEvent;
    this.editorModel = editorModel;

    this.event.on('NODE_CREATED', ({ node }) => {
      if (node.name !== DataObjectName.DataObject) {
        return;
      }

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

  /**
   * 触发对象名称变更事件
   * @param params
   */
  @command('DO_STORE:OBJECT_NAME_CHANGED')
  emitObjectNameChanged(params: { node: BaseNode; object: DataObject }) {
    this.dataObjectEvent.emit('OBJECT_NAME_CHANGED', params);
  }

  private gc = debounce(() => {
    this.objectsWillRemoved.forEach(i => tryDispose(i));
    this.objectsWillRemoved.clear();
  });
}
