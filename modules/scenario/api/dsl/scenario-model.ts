import { toArray } from '@/lib/utils';
import { BaseContainer, Tree } from '@/modules/domain/api/dsl/shared';
import uniqBy from 'lodash/uniqBy';

import { ScenarioObjectName, ActivityDSL, ActivityBindingType } from '../../scenario-design/dsl';

import { DomainDependencyDSL, ExternalDependencyDSL } from './interface';

export class ScenarioModelContainer extends BaseContainer {
  private dependencies: DomainDependencyDSL[] = [];
  private externalDependencies: ExternalDependencyDSL[] = [];

  constructor(tree: Record<string, Tree>) {
    super();

    this.traverse(tree);
  }

  toDSL(): {
    domainDependencies: DomainDependencyDSL[];
    externalDependencies: ExternalDependencyDSL[];
  } {
    return {
      domainDependencies: uniqBy(this.dependencies, i => {
        return `${i.teamId ?? 'team'}-${i.domainId}-${i.versionId}-${i.serviceId}`;
      }),
      externalDependencies: uniqBy(this.externalDependencies, i => i.name),
    };
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
      const serviceIds = toArray(dsl.binding.domainServiceId);

      for (const serviceId of serviceIds) {
        this.dependencies.push({
          domainId: dsl.binding.domainId,
          versionId: dsl.binding.versionId,
          serviceId: serviceId,
        });
      }
    } else if (dsl.binding?.type === ActivityBindingType.ExternalService && dsl.binding.serviceName) {
      this.externalDependencies.push({
        name: dsl.binding.serviceName,
        description: dsl.binding.serviceDescription,
      });
    }
  }
}
