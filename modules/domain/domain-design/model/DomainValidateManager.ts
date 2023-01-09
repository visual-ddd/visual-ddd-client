import { BaseEditorEvent, BaseEditorModel, BaseNode } from '@/lib/editor';
import { debounce } from '@wakeapp/utils';
import { NameDSL } from '../dsl';
import { DomainObject } from './DomainObject';
import { DomainObjectEvent } from './DomainObjectEvent';
import { DomainObjectStore } from './DomainObjectStore';

enum CheckScope {
  /**
   * 命名校验
   */
  Name,

  /**
   * 根节点校验
   */
  Root,

  /**
   * 完整校验
   */
  Full,

  /**
   * 不需要处理
   */
  Never,
}

/**
 * 校验管理器
 */
export class DomainValidateManager {
  private event: BaseEditorEvent;
  private domainObjectEvent: DomainObjectEvent;
  private editorModel: BaseEditorModel;
  private store: DomainObjectStore;

  /**
   * 请求队列
   */
  private queue: Map<string, Set<CheckScope>> = new Map();

  constructor(inject: {
    event: BaseEditorEvent;
    editorModel: BaseEditorModel;
    store: DomainObjectStore;
    domainObjectEvent: DomainObjectEvent;
  }) {
    this.domainObjectEvent = inject.domainObjectEvent;
    this.event = inject.event;
    this.editorModel = inject.editorModel;
    this.store = inject.store;

    this.eventHandler();
  }

  private eventHandler() {
    /**
     * 节点新增：验证自身
     */
    this.event.on('NODE_CREATED', evt => {
      const { node } = evt;

      this.checkFull(node);
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
      this.push(node.id, CheckScope.Never);
    });

    /**
     * 节点失活, 检查本身，以及同级别命名冲突
     */
    this.event.on('NODE_UNACTIVE', evt => {
      const { node } = evt;

      // 全量检查自身
      this.checkFull(node);

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
    this.push(node.id, CheckScope.Root);
    this.push(node.id, CheckScope.Name);

    // 检查依赖关系
    this.checkDependencies(node);

    // 检查容器, 同级别命名冲突
    this.checkNameConflict(node);
  }

  private checkFull(node: BaseNode) {
    this.push(node.id, CheckScope.Full);
  }

  private checkDependencies(node: BaseNode) {
    const object = this.store.getObjectById(node.id)!;
    if (!object) {
      return;
    }

    // 触发依赖关系检查
    for (const obj of object.objectsDependentOnMe) {
      this.push(obj.id, CheckScope.Root);
    }
  }

  private checkNameConflict(node: BaseNode) {
    const object = this.store.getObjectById(node.id)!;
    if (!object) {
      return;
    }

    // 自身命名检查
    this.push(object.id, CheckScope.Name);

    // 容器检查
    if (object.package) {
      this.push(object.package.id, CheckScope.Root);
    }

    // 同作用域命名冲突检查
    for (const obj of object.objectsInSameScope) {
      this.push(obj.id, CheckScope.Name);
    }
  }

  private push(id: string, scope: CheckScope) {
    if (!this.queue.has(id)) {
      this.queue.set(id, new Set([scope]));
    } else {
      this.queue.get(id)?.add(scope);
    }

    this.validate();
  }

  private cancelNever(id: string) {
    if (this.queue.has(id)) {
      this.queue.get(id)?.delete(CheckScope.Never);
    }
  }

  /**
   * 进行验证
   */
  private validate = debounce(() => {
    const queue = this.queue;
    this.queue = new Map();

    for (const [id, scopes] of queue) {
      const object = this.store.getObjectById(id);
      if (!object) {
        continue;
      }

      if (scopes.has(CheckScope.Never)) {
        // 已删除，不需要验证
        continue;
      }

      if (scopes.has(CheckScope.Full)) {
        // 全量检查
        this.validateFull(object);
      } else {
        if (scopes.has(CheckScope.Name)) {
          this.validateName(object);
        }

        if (scopes.has(CheckScope.Root)) {
          this.validateRoot(object);
        }
      }
    }
  }, 600);

  private validateFull(object: DomainObject<NameDSL>) {
    console.log(`---- check full: ${object.id}  ${object.readableTitle}  ----`);
    return this.getFormModel(object)?.validateAll();
  }

  private validateName(object: DomainObject<NameDSL>) {
    console.log(`---- check name: ${object.id} ${object.readableTitle} ----`);
    return this.getFormModel(object)?.validateField('name');
  }

  private validateRoot(object: DomainObject<NameDSL>) {
    console.log(`---- check root: ${object.id}  ${object.readableTitle}  ----`);
    return this.getFormModel(object)?.validateRoot();
  }

  private getFormModel(object: DomainObject<NameDSL>) {
    return this.editorModel.formStore.getFormModel(object.id);
  }
}
