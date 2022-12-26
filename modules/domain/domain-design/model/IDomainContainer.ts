import { NameDSL } from '../dsl';
import { DomainObject } from './DomainObject';
import { DomainObjectCommand } from './DomainObjectCommand';
import { DomainObjectRule } from './DomainObjectRule';

export interface IDomainObjectContainer {
  /**
   * 包含的命令对象
   */
  commands: DomainObjectCommand[];

  /**
   * 包含的规则
   */
  rules: DomainObjectRule[];

  getObjectById(id: string): DomainObject<NameDSL> | undefined;
}
