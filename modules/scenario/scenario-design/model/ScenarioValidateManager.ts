import { BaseEditorEvent, BaseEditorModel, BaseEditorValidateManager } from '@/lib/editor';

export class ScenarioValidateManager extends BaseEditorValidateManager {
  private event: BaseEditorEvent;

  constructor(inject: { event: BaseEditorEvent; editorModel: BaseEditorModel }) {
    super(inject);

    this.event = inject.event;

    this.eventHandler();
  }

  private eventHandler() {
    this.event.on('NODE_UNACTIVE', evt => {
      const { node } = evt;

      this.checkFull(node.id);
    });
  }
}
