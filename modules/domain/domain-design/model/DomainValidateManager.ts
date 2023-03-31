import { BaseEditorEvent, BaseEditorValidateManager, BaseEditorValidateManagerInject, BaseNode } from '@/lib/editor';
import { DomainObjectEvent } from './DomainObjectEvent';
import { DomainObjectStore } from './DomainObjectStore';

/**
 * 校验管理器
 */
export class DomainValidateManager extends BaseEditorValidateManager {
  private event: BaseEditorEvent;
  private domainObjectEvent: DomainObjectEvent;
  private store: DomainObjectStore;

  constructor(
    inject: {
      event: BaseEditorEvent;
      store: DomainObjectStore;
      domainObjectEvent: DomainObjectEvent;
    } & BaseEditorValidateManagerInject
  ) {
    super(inject);

    this.domainObjectEvent = inject.domainObjectEvent;
    this.event = inject.event;
    this.store = inject.store;

    this.eventHandler();
  }

  private eventHandler() {
    /**
     * 节点新增：验证自身
     */
    this.event.on('NODE_CREATED', evt => {
      const { node } = evt;

      this.checkFull(node.id);
      this.cancelNever(node.id);
    });

    /**
     * 节点父级关系变更: 需要验证自身、容器、同一个容器下成员命名冲突、依赖关系检查
     */
    this.event.on('NODE_APPEND_CHILD', evt => {
      const { child } = evt;

      this.handleRelationShipChange(child);
    });

    /**
     * 父级关系变更： 需要验证自身、容器，同一个容器下成员命名冲突、依赖关系检查
     */
    this.event.on('NODE_BEFORE_REMOVE_CHILD', evt => {
      const { child } = evt;

      this.handleRelationShipChange(child);
    });

    /**
     * 节点移除：验证自身, 因为移除的同时会触发 REMOVE_CHILD, 所以这里不需要处理
     * 只是取消掉被删除节点的全量检查
     */
    this.event.on('NODE_REMOVED', evt => {
      // IGNORE
      const { node } = evt;
      this.checkNever(node.id);
    });

    /**
     * 节点失活, 检查本身，以及同级别命名冲突
     */
    this.event.on('NODE_UNACTIVE', evt => {
      const { node } = evt;

      // 全量检查自身
      this.checkFull(node.id);

      // 检查名冲突
      this.checkNameConflict(node);
    });

    /**
     * 名称变化
     */
    this.domainObjectEvent.on('OBJECT_NAME_CHANGED', ({ object }) => {
      const node = object.node;

      this.checkNameConflict(node);
    });

    this.domainObjectEvent.on('OBJECT_BEFORE_AGGREGATION_CHANGE', ({ node, object }) => {
      console.log(`聚合关系变动`, node, object.package);
      this.handleRelationShipChange(node);
    });

    this.domainObjectEvent.on('OBJECT_AGGREGATION_CHANGED', ({ node, object }) => {
      console.log(`聚合关系变动`, node, object.package);
      this.handleRelationShipChange(node);
    });
  }

  /**
   * 关联关系变动
   * @param node
   */
  private handleRelationShipChange(node: BaseNode) {
    this.checkRoot(node.id);
    this.checkName(node.id);

    // 检查依赖关系
    this.checkDependencies(node);

    // 检查容器, 同级别命名冲突
    this.checkNameConflict(node);
  }

  private checkDependencies(node: BaseNode) {
    const object = this.store.getObjectById(node.id)!;
    if (!object) {
      return;
    }

    // 触发依赖关系检查
    for (const obj of object.objectsDependentOnMe) {
      this.checkRoot(obj.id);
    }
  }

  private checkNameConflict(node: BaseNode) {
    const object = this.store.getObjectById(node.id)!;
    if (!object) {
      return;
    }

    // 自身命名检查
    this.checkName(object.id);

    // 容器检查
    if (object.package) {
      this.checkRoot(object.package.id);
    }

    // 同作用域命名冲突检查
    for (const obj of object.objectInSameNameScope) {
      this.checkName(obj.id);
    }
  }
}
