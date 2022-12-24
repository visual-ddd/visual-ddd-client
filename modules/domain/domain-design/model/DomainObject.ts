import { BaseNode } from '@/lib/editor';
import { derive } from '@/lib/store';
import { makeObservable } from 'mobx';
import { NameDSL, UntitledInHumanReadable, UntitledInUpperCamelCase } from '../dsl';
import { IDomainObjectContainer } from './IDomainContainer';

export interface DomainObjectInject {
  node: BaseNode;
  container: IDomainObjectContainer;
}

/**
 * 领域对象
 */
export abstract class DomainObject<DSL extends NameDSL> {
  /**
   * 基础对象
   */
  node: BaseNode;

  get id() {
    return this.node.id;
  }

  /**
   * 图形名称
   */
  get shapeName() {
    return this.node.name;
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

  @derive
  get hasParent() {
    return this.node.hasParent;
  }

  /**
   * 依赖, 根据不同的类型计算
   */
  abstract dependencies: DomainObject<NameDSL>[];

  /**
   * 是否可以被引用, 比如实体、值对象可以被引入，聚合、命令不能被引用
   */
  abstract referable: boolean;

  /**
   * 界面上展示的名称
   */
  abstract readableTitle: string;

  protected container: IDomainObjectContainer;

  constructor(inject: DomainObjectInject) {
    this.node = inject.node;
    this.container = inject.container;

    makeObservable(this);
  }
}
