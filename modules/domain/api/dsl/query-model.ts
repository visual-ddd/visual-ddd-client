import * as DSL from './interface';
import * as ViewDSL from '@/modules/domain/domain-design/dsl/dsl';
import { Void } from '@/modules/domain/domain-design/dsl/constants';

import {
  BaseContainer,
  IContainer,
  Node,
  Tree,
  transformMeta,
  transformProperty,
  transformSource,
  transformType,
  Rule,
} from './domain-model';

export class Query extends Node<ViewDSL.QueryDSL> {
  rules: Rule[] = [];

  toDSL(): DSL.QueryDSL {
    const { uuid, title, name, description, meta, properties, source, pagination, result } = this.properties;

    return {
      uuid,
      title,
      name,
      description,
      meta: transformMeta(meta),
      source: transformSource(source),
      rules: this.rules.map(i => i.toDSL()),
      pagination,
      properties: properties.map(i => transformProperty(i, this.getReference)),
      return: {
        type: result ? transformType(result, this.getReference) : Void,
      },
    };
  }
}

export class DTO extends Node<ViewDSL.DTODSL> {
  toDSL(): DSL.DTODSL {
    const { uuid, title, name, description, meta, properties } = this.properties;

    return {
      uuid,
      title,
      name,
      description,
      meta: transformMeta(meta),
      properties: properties.map(i => transformProperty(i, this.getReference)),
    };
  }
}

export class Container extends BaseContainer implements IContainer {
  queries: Query[] = [];
  dtos: DTO[] = [];

  /**
   * 收集所有有效的节点
   */
  nodesIndexByUUID: Map<string, Node> = new Map();

  constructor(tree: Record<string, Tree>) {
    super();

    this.traverse(tree);
  }

  toDSL(): DSL.QueryModelDSL {
    return {
      queries: this.queries.map(i => i.toDSL()),
      dtos: this.dtos.map(i => i.toDSL()),
    };
  }

  getNodeById(id: string): Node<any> | undefined {
    return this.nodesIndexByUUID.get(id);
  }

  handle(node: Tree, tree: Record<string, Tree>): void {
    const type = node.properties.__node_name__;

    switch (type) {
      case 'query': {
        const properties = node.properties as unknown as ViewDSL.QueryDSL;
        const query = new Query(properties.uuid, properties, this);

        this.nodesIndexByUUID.set(query.id, query);
        this.queries.push(query);

        break;
      }
      case 'dto': {
        const properties = node.properties as unknown as ViewDSL.DTODSL;
        const dto = new DTO(properties.uuid, properties, this);

        this.nodesIndexByUUID.set(dto.id, dto);
        this.dtos.push(dto);

        break;
      }
      case 'rule': {
        const properties = node.properties as unknown as ViewDSL.RuleDSL;
        const rule = new Rule(properties.uuid, properties, this);

        this.nodesIndexByUUID.set(rule.id, rule);

        this.addPostTraverse(() => {
          if (properties.aggregator) {
            const aggregator = this.nodesIndexByUUID.get(properties.aggregator.referenceId) as Query | undefined;
            aggregator?.rules.push(rule);
          }
        });

        break;
      }
    }
  }
}

/**
 * DSL 转换
 */
export function transform(tree: Record<string, Tree>): DSL.QueryModelDSL {
  const container = new Container(tree);

  return container.toDSL();
}
