import { BaseEditorEvent, BaseEditorModel, BaseEditorValidateManager } from '@/lib/editor';
import { MapperStore } from './MapperStore';

/**
 * 验证管理器
 */
export class MapperValidateManager extends BaseEditorValidateManager {
  private event: BaseEditorEvent;
  private store: MapperStore;

  constructor(inject: { event: BaseEditorEvent; store: MapperStore; editorModel: BaseEditorModel }) {
    super(inject);

    this.event = inject.event;
    this.store = inject.store;

    this.eventHandler();
  }

  private eventHandler() {
    this.event.on('NODE_UNACTIVE', evt => {
      const { node } = evt;

      this.checkFull(node.id);

      this.store.mappersInArray.forEach(i => {
        this.checkName(i.id);
      });
    });
  }
}
