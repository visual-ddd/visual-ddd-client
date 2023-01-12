import { BaseEditorEvent, BaseEditorModel, BaseEditorValidateManager, FormModel } from '@/lib/editor';
import { DataObjectEvent } from './DataObjectEvent';
import { DataObjectStore } from './DataObjectStore';

const CheckScope = BaseEditorValidateManager.CheckScope;

/**
 * 校验管理器
 */
export class DataObjectValidateManager extends BaseEditorValidateManager {
  private event: BaseEditorEvent;
  private store: DataObjectStore;
  private dataObjectEvent: DataObjectEvent;

  constructor(inject: {
    event: BaseEditorEvent;
    dataObjectEvent: DataObjectEvent;
    editorModel: BaseEditorModel;
    store: DataObjectStore;
  }) {
    super(inject);

    this.dataObjectEvent = inject.dataObjectEvent;
    this.event = inject.event;
    this.store = inject.store;

    this.eventHandler();
  }

  private eventHandler() {
    /**
     * 节点新增：验证自身
     */
    this.event.on('NODE_APPEND_CHILD', evt => {
      const { child: node } = evt;

      this.cancelNever(node.id);
      this.checkFull(node.id);

      // 检查命名冲突
      this.checkNameConflict(node.id);
      this.checkDependencies(node.id);
    });

    /**
     * 节点移除
     */
    this.event.on('NODE_BEFORE_REMOVE_CHILD', evt => {
      const { child: node } = evt;

      this.checkNever(node.id);

      // 检查依赖
      this.checkDependencies(node.id);

      // 检查命名冲突
      this.checkNameConflict(node.id);
    });

    /**
     * 节点失活, 检查本身，以及同级别命名冲突
     */
    this.event.on('NODE_UNACTIVE', evt => {
      const { node } = evt;

      // 全量检查自身
      this.checkFull(node.id);

      // 检查名冲突
      this.checkNameConflict(node.id);
    });

    // 检查名冲突
    this.dataObjectEvent.on('OBJECT_NAME_CHANGED', ({ node }) => {
      this.checkNameConflict(node.id);
    });
  }

  /**
   * 检查依赖关系
   * @param node
   * @returns
   */
  private checkDependencies(id: string) {
    const object = this.store.getObjectById(id)!;
    if (!object) {
      return;
    }

    // 触发依赖关系检查
    for (const obj of object.objectsDependOnMe) {
      this.push(obj.id, CheckScope.Root);
    }
  }

  /**
   * 检查命名冲突
   * @param node
   * @returns
   */
  private checkNameConflict(id: string) {
    // 同作用域命名冲突检查
    for (const obj of this.store.objectsInArray) {
      this.push(obj.id, CheckScope.Name);
    }
  }

  // 覆盖名称验证，扩展表名验证
  override validateName(object: FormModel) {
    super.validateName(object);

    // 验证表名
    object.validateField('tableName');
  }
}
