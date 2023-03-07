import { DomainObjectName } from '../domain-design/dsl';
import { ValueObjectDSL, EntityDSL, EnumDSL, CommandDSL, AggregationDSL } from '../domain-design/dsl/dsl';

export type DomainObjectDefinition =
  | { type: DomainObjectName.ValueObject; value: ValueObjectDSL }
  | {
      type: DomainObjectName.Entity;
      value: EntityDSL;
    }
  | { type: DomainObjectName.Enum; value: EnumDSL }
  | { type: DomainObjectName.Command; value: CommandDSL }
  | { type: DomainObjectName.Aggregation; value: AggregationDSL };

export interface IDomainObjectStore {
  getObjectById(id: string): DomainObjectDefinition | undefined;
}

export interface IDomainGeneratorHandler {
  /**
   * 聚合根自动生成
   * @param root
   */
  domainGenerate(root: EntityDSL): void;
}
