import { BaseContainer, Tree } from '@/modules/domain/api/dsl/shared';

import { ScenarioObjectName, ActivityDSL, ActivityBindingType } from '../../scenario-design/dsl';
import { DomainDependencyDSL } from './interface';

export class ScenarioModelContainer extends BaseContainer {
  private dependencies: DomainDependencyDSL[] = [];

  constructor(tree: Record<string, Tree>) {
    super();

    this.traverse(tree);
  }

  toDSL(): DomainDependencyDSL[] {
    return this.dependencies;
  }

  handle(node: Tree) {
    const type = node.properties.__node_name__;
    if (type !== ScenarioObjectName.Activity) {
      return;
    }

    const dsl = node.properties as unknown as ActivityDSL;

    if (
      dsl.binding?.type === ActivityBindingType.DomainService &&
      dsl.binding.domainId &&
      dsl.binding.versionId &&
      dsl.binding.domainServiceId
    ) {
      this.dependencies.push({
        domainId: dsl.binding.domainId,
        versionId: dsl.binding.versionId,
        serviceId: dsl.binding.domainServiceId,
      });
    }
  }
}
