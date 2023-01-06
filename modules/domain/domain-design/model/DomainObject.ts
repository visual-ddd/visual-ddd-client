import { BaseEditorModel, BaseNode, IDisposable } from '@/lib/editor';
import { derive } from '@/lib/store';
import { booleanPredicate, Disposer } from '@wakeapp/utils';
import { makeObservable, reaction } from 'mobx';
import { DomainObjectName, NameDSL, RelationShipDSL, UntitledInHumanReadable, UntitledInUpperCamelCase } from '../dsl';
import { DomainObjectStore } from './DomainObjectStore';
import { IEdgeDeclaration } from './IEdgeDeclaration';

export interface DomainObjectInject {
  node: BaseNode;
  editorModel: BaseEditorModel;
  store: DomainObjectStore;
}

/**
 * 领域对象
 */
export abstract class DomainObject<DSL extends NameDSL> implements IDisposable {
  protected store: DomainObjectStore;
  protected editorModel: BaseEditorModel;
  /**
   * 基础对象
   */
  readonly node: BaseNode;

  /**
   * 资源释放器
   */
  protected disposer = new Disposer();

  @derive
  get hasParent() {
    return this.node.hasParent;
  }

  /**
   * 父节点(图形关系上的) ID,
   */
  @derive
  get parentId() {
    return this.hasParent ? this.node.parent?.id : undefined;
  }

  /**
   * 节点唯一 ID
   */
  get id() {
    return this.node.id;
  }

  /**
   * 图形名称
   */
  get shapeName(): DomainObjectName {
    return this.node.name as DomainObjectName;
  }

  /**
   * DSL 数据
   */
  get dsl(): DSL {
    return this.node.properties as unknown as DSL;
  }

  /**
   * 标题
   */
  @derive
  get title() {
    return this.dsl.title || UntitledInHumanReadable;
  }

  /**
   * 名称
   */
  @derive
  get name() {
    return this.dsl.name || UntitledInUpperCamelCase;
  }

  /**
   * 可读的类型名称
   */
  abstract objectTypeTitle: string;

  /**
   * 界面上展示的名称
   */
  @derive
  get readableTitle() {
    return `${this.title}(${this.name})`;
  }

  /**
   * 依赖关系
   */
  abstract dependencies: DomainObject<NameDSL>[];

  /**
   * 关联关系
   */
  abstract associations: DomainObject<NameDSL>[];

  /**
   * 聚合关系
   */
  abstract aggregations: DomainObject<NameDSL>[];

  /**
   * 组合关系
   */
  abstract compositions: DomainObject<NameDSL>[];

  /**
   * 是否可以被引用, 比如实体、值对象、命令可以被引引用，聚合、规则不能被引用
   */
  abstract referable: boolean;

  /**
   * 当前对象所属的包，这将决定对象的作用域范围
   */
  abstract package?: DomainObject<NameDSL>;

  /**
   * 和当前对象处于相同作用域的对象
   *
   * - 相同作用域下的对象可以相互引用
   * - 相同作用域下的对象不能存在命名冲突
   * - 需要排除掉自身
   */
  abstract objectsInSameScope: DomainObject<NameDSL>[];

  /**
   * 获取依赖当前对象的对象
   */
  abstract objectsDependentOnMe: DomainObject<NameDSL>[];

  /**
   * 是否存在引用错误，比如引用的对象已经被移除
   */
  abstract hasReferencesError: boolean;

  /**
   * 依赖边
   */
  @derive
  get dependenciesEdges(): IEdgeDeclaration[] {
    return this.getEdges(this.dependencies, RelationShipDSL.Dependency);
  }

  /**
   * 关联边
   */
  @derive
  get associationsEdges(): IEdgeDeclaration[] {
    return this.getEdges(this.associations, RelationShipDSL.Association);
  }

  /**
   * 聚合边
   */
  @derive
  get aggregationsEdges(): IEdgeDeclaration[] {
    return this.getEdges(this.aggregations, RelationShipDSL.Aggregation);
  }

  /**
   * 所有关联边
   */
  @derive
  get edges() {
    return this.dependenciesEdges.concat(this.associationsEdges).concat(this.aggregationsEdges);
  }

  constructor(inject: DomainObjectInject) {
    this.node = inject.node;
    this.store = inject.store;
    this.editorModel = inject.editorModel;

    makeObservable(this);

    // 监听名称变化
    this.disposer.push(
      reaction(
        () => this.dsl.name,
        name => {
          this.store.emitNameChanged({ node: this.node, object: this });
        },
        { delay: 800, name: 'WATCH_OBJECT_NAME' }
      )
    );
  }

  dispose(): void {
    this.disposer.release();
  }

  private getEdges(targets: DomainObject<NameDSL>[], type: RelationShipDSL): IEdgeDeclaration[] {
    return targets
      .map(target => {
        // 过滤掉自我循环
        if (target.id === this.id) {
          return null;
        }

        return {
          id: `${this.id}->${target.id}`,
          source: this.id,
          target: target.id,
          type: type,
          sourceObject: this,
          targetObject: target,
        } satisfies IEdgeDeclaration;
      })
      .filter(booleanPredicate);
  }
}
