import { BaseEditorModel, BaseNode } from '@/lib/editor';
import { derive } from '@/lib/store';
import { booleanPredicate } from '@wakeapp/utils';
import { makeObservable } from 'mobx';
import { DomainObjectName, NameDSL, RelationShipDSL, UntitledInHumanReadable, UntitledInUpperCamelCase } from '../dsl';
import { IDomainObjectContainer } from './IDomainContainer';
import { IEdgeDeclaration } from './IEdgeDeclaration';

export interface DomainObjectInject {
  node: BaseNode;
  editorModel: BaseEditorModel;
  container: IDomainObjectContainer;
}

/**
 * 领域对象
 */
export abstract class DomainObject<DSL extends NameDSL> {
  /**
   * 基础对象
   */
  protected node: BaseNode;
  protected container: IDomainObjectContainer;
  protected editorModel: BaseEditorModel;

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

  abstract objectTypeTitle: string;

  /**
   * 名称
   */
  @derive
  get name() {
    return this.dsl.name || UntitledInUpperCamelCase;
  }

  /**
   * 界面上展示的名称
   */
  @derive
  get readableTitle() {
    return `${this.title}(${this.name})`;
  }

  @derive
  get hasParent() {
    return this.node.hasParent;
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
   * 是否可以被引用, 比如实体、值对象可以被引入，聚合、命令不能被引用
   */
  abstract referable: boolean;

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
    this.container = inject.container;
    this.editorModel = inject.editorModel;

    makeObservable(this);
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
