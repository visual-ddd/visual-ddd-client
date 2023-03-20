import * as ViewDSL from '@/modules/domain/domain-design/dsl/dsl';
import { VoidClass, Void } from '@/modules/domain/domain-design/dsl/constants';
import { stringifyTypeDSL } from '@/modules/domain/domain-design/dsl/stringify';

import * as DSL from './interface';
import { ROOT, Tree, CoreProperties, BaseContainer, Node, IContainer } from './shared';

/**
 * 转换字符串，如果为空则返回 undefined
 * @param str
 * @returns
 */
export function transformString(str?: string): string | undefined {
  if (!str) {
    return;
  }

  const trimmed = str.trim();

  if (trimmed === '') {
    return;
  }

  return trimmed;
}

/**
 * 转换元数据
 * @param meta
 * @returns
 */
export function transformMeta(meta?: ViewDSL.MetaDSL[]): DSL.MetaDSL | undefined {
  if (!meta) {
    return;
  }

  return meta.reduce((acc, cur) => {
    if (cur.key && cur.value) {
      acc[cur.key] = cur.value;
    }

    return acc;
  }, {} as DSL.MetaDSL);
}

/**
 * 转换类型
 * @param type
 * @param getReference
 * @returns
 */
export function transformType(
  type: ViewDSL.TypeDSL,

  getReference: (id: string) => ViewDSL.NameDSL
): string {
  return stringifyTypeDSL(type, id => {
    const dsl = getReference(id);

    // 引用类型返回对应的对象的 [name:id]
    return `[${dsl.name}:${id}]`;
  });
}

export function transformProperty(
  property: ViewDSL.PropertyDSL,
  getReference: (id: string) => ViewDSL.NameDSL
): DSL.PropertyDSL {
  const { uuid, title, name, description, meta, access, type, optional } = property;

  return {
    uuid,
    title,
    name,
    description,
    meta: transformMeta(meta),
    optional,
    access,
    type: type ? transformType(type, getReference) : VoidClass,
  };
}

export function transformParameter(
  property: ViewDSL.ParameterDSL,
  getReference: (id: string) => ViewDSL.NameDSL
): DSL.ParameterDSL {
  const { uuid, title, name, description, meta, type, optional } = property;

  return {
    uuid,
    title,
    name,
    description,
    optional,
    meta: transformMeta(meta),
    type: type ? transformType(type, getReference) : VoidClass,
  };
}

export function transformMethods(
  methods: ViewDSL.MethodDSL[],
  getReference: (id: string) => ViewDSL.NameDSL
): DSL.MethodDSL[] {
  const map: Record<string, DSL.MethodDSL> = {};

  for (const m of methods) {
    const { uuid, title, name, description, meta, access, abstract, parameters, result } = m;

    const define = map[name];

    const signature: DSL.MethodDefineDSL = {
      description,
      parameters: parameters.map(p => transformParameter(p, getReference)),
      return: {
        type: result ? transformType(result, getReference) : Void,
      },
    };

    if (define) {
      define.signature = Array.isArray(define.signature) ? define.signature : [define.signature];
      define.signature.push(signature);
    } else {
      map[name] = {
        uuid,
        title,
        name,
        description,
        meta: transformMeta(meta),
        access,
        abstract,
        signature,
      };
    }
  }

  return Object.values(map);
}

export function transformEnum(e: ViewDSL.EnumDSL): DSL.EnumDSL {
  const { uuid, title, name, description, meta, baseType, members } = e;

  return {
    uuid,
    title,
    name,
    description,
    meta: transformMeta(meta),
    baseType,
    members: members.map(m => {
      const { uuid, title, name, description, meta, code } = m;

      return {
        uuid,
        title,
        name,
        description,
        meta: transformMeta(meta),
        code: baseType === 'number' ? parseFloat(code) : code,
      };
    }),
  };
}

export function transformRule(e: ViewDSL.RuleDSL): DSL.RuleDSL {
  const { uuid, title, name, description, meta } = e;

  return {
    uuid,
    title,
    name,
    description,
    meta: transformMeta(meta),
  };
}

export function transformSource(source: ViewDSL.SourceDSL): DSL.SourceDSL[] {
  const list: DSL.SourceDSL[] = [];
  if (source.http.enabled) {
    list.push({ type: 'http' });
  }
  if (source.rpc.enabled) {
    list.push({ type: 'rpc' });
  }
  if (source.event.enabled) {
    list.push({ type: 'event', value: source.event.value });
  }

  if (source.schedule.enabled) {
    list.push({ type: 'schedule', value: source.schedule.value });
  }

  return list;
}

/**
 * 实体
 */
export class Entity extends Node<ViewDSL.EntityDSL> {
  /**
   * 所属聚合
   */
  aggregation!: Aggregation;

  toDSL(): DSL.EntityDSL {
    const { uuid, title, name, description, meta, properties, methods, id } = this.properties;

    const propertiesDSL = properties.map(i => {
      return transformProperty(i, this.getReference);
    });

    return {
      uuid,
      title,
      name,
      description,
      meta: transformMeta(meta),
      id: propertiesDSL.find(i => i.uuid === id)!,
      properties: propertiesDSL.filter(i => i.uuid !== id),
      methods: transformMethods(methods, this.getReference),
    };
  }
}

/**
 * 值对象
 */
export class ValueObject extends Node<ViewDSL.ValueObjectDSL> {
  /**
   * 所属聚合
   */
  aggregation!: Aggregation;

  toDSL(): DSL.ValueObjectDSL {
    const { uuid, title, name, description, meta, properties, methods } = this.properties;

    const propertiesDSL = properties.map(i => {
      return transformProperty(i, this.getReference);
    });

    return {
      uuid,
      title,
      name,
      description,
      meta: transformMeta(meta),
      properties: propertiesDSL,
      methods: transformMethods(methods, this.getReference),
    };
  }
}

export class Enum extends Node<ViewDSL.EnumDSL> {
  /**
   * 所属聚合
   */
  aggregation!: Aggregation;

  toDSL(): DSL.EnumDSL {
    return transformEnum(this.properties);
  }
}

/**
 * 规则
 */
export class Rule extends Node<ViewDSL.RuleDSL> {
  toDSL(): DSL.RuleDSL {
    return transformRule(this.properties);
  }
}

export class Command extends Node<ViewDSL.CommandDSL> {
  rules: Rule[] = [];

  /**
   * 所属聚合
   */
  aggregation!: Aggregation;

  toDSL(): DSL.CommandDSL {
    const {
      uuid,
      title,
      name,
      description,
      meta,
      repository,
      eventSendable,
      category,
      result,
      properties,
      source,
      eventProperties,
    } = this.properties;

    return {
      uuid,
      title,
      name,
      description,
      meta: transformMeta(meta),
      rules: this.rules.map(i => i.toDSL()),
      category: transformString(category),
      repository,
      eventSendable,
      source: transformSource(source),
      properties: properties.map(i => transformProperty(i, this.getReference)),
      event: {
        uuid,
        name: `${name}Event`,
        properties: eventProperties.map(i => transformProperty(i, this.getReference)),
      },
      return: {
        type: result ? transformType(result, this.getReference) : Void,
      },
    };
  }
}

export class Aggregation extends Node<ViewDSL.AggregationDSL> {
  private entities: Entity[] = [];
  private valueObjects: ValueObject[] = [];
  private enums: Enum[] = [];
  private commands: Command[] = [];

  addEntity(entity: Entity) {
    this.entities.push(entity);

    entity.aggregation = this;
  }

  addValueObject(valueObject: ValueObject) {
    this.valueObjects.push(valueObject);

    valueObject.aggregation = this;
  }

  addEnum(enumObject: Enum) {
    this.enums.push(enumObject);
    enumObject.aggregation = this;
  }

  addCommand(command: Command) {
    this.commands.push(command);
    command.aggregation = this;
  }

  /**
   * 转换为 dsl
   */
  toDSL(): DSL.AggregateDSL {
    const { uuid, title, name, description, meta } = this.properties;

    return {
      uuid,
      title,
      name,
      description,
      meta: transformMeta(meta),
      root: this.entities.find(i => i.properties.isAggregationRoot)!.toDSL(),
      entities: this.entities.filter(i => !i.properties.isAggregationRoot).map(i => i.toDSL()),
      valueObjects: this.valueObjects.map(i => i.toDSL()),
      enums: this.enums.map(i => i.toDSL()),
      commands: this.commands.map(i => i.toDSL()),
    };
  }
}

export class DomainModelContainer extends BaseContainer implements IContainer {
  aggregations: Aggregation[] = [];

  /**
   * 收集所有有效的节点
   */
  nodesIndexByUUID: Map<string, Node> = new Map();

  /**
   * 深度递归遍历
   * @param tree
   */
  constructor(tree: Record<string, Tree>) {
    super();

    this.traverse(tree);
  }

  getNodeById(id: string): Node<any> | undefined {
    return this.nodesIndexByUUID.get(id);
  }

  /**
   * 转换为聚合 DSL
   * @returns
   */
  toDSL(): DSL.DomainModelDSL {
    return {
      aggregates: this.aggregations.map(i => i.toDSL()),
    };
  }

  handle(node: Tree, tree: Record<string, Tree>): void {
    const getParent = (n: Tree) => {
      const parentId = n.parent;
      if (parentId == null || parentId === ROOT) {
        return null;
      }

      return tree[parentId];
    };

    const isAggregation = (n: Tree): n is Tree<ViewDSL.AggregationDSL & CoreProperties> => {
      return n.properties.__node_name__ === 'aggregation';
    };

    const type = node.properties.__node_name__;

    if (node.properties.uuid && node.id !== node.properties.uuid) {
      throw new Error(`uuid 不匹配: ${node.id} ${JSON.stringify(node.properties)}`);
    }

    switch (type) {
      case 'aggregation': {
        const properties = node.properties as unknown as ViewDSL.AggregationDSL;
        const aggregation = new Aggregation(properties.uuid, properties, this);
        this.nodesIndexByUUID.set(aggregation.id, aggregation);

        this.aggregations.push(aggregation);

        // 聚合
        break;
      }
      case 'entity': {
        const properties = node.properties as unknown as ViewDSL.EntityDSL;
        const entity = new Entity(properties.uuid, properties, this);
        this.nodesIndexByUUID.set(entity.id, entity);

        const parent = getParent(node);

        if (parent && isAggregation(parent)) {
          const aggregation = this.nodesIndexByUUID.get(parent.properties.uuid) as Aggregation;
          aggregation.addEntity(entity);
        }

        break;
      }
      case 'value-object': {
        const properties = node.properties as unknown as ViewDSL.ValueObjectDSL;
        const valueObject = new ValueObject(properties.uuid, properties, this);
        this.nodesIndexByUUID.set(valueObject.id, valueObject);

        const parent = getParent(node);

        if (parent && isAggregation(parent)) {
          const aggregation = this.nodesIndexByUUID.get(parent.properties.uuid) as Aggregation;
          aggregation.addValueObject(valueObject);
        }

        break;
      }
      case 'enum': {
        const properties = node.properties as unknown as ViewDSL.EnumDSL;
        const enumObject = new Enum(properties.uuid, properties, this);
        this.nodesIndexByUUID.set(enumObject.id, enumObject);

        const parent = getParent(node);

        if (parent && isAggregation(parent)) {
          const aggregation = this.nodesIndexByUUID.get(parent.properties.uuid) as Aggregation;
          aggregation.addEnum(enumObject);
        }

        break;
      }
      case 'command': {
        const properties = node.properties as unknown as ViewDSL.CommandDSL;
        const command = new Command(properties.uuid, properties, this);

        this.nodesIndexByUUID.set(command.id, command);

        this.addPostTraverse(() => {
          if (properties.aggregation) {
            const aggregation = this.nodesIndexByUUID.get(properties.aggregation.referenceId) as
              | Aggregation
              | undefined;
            aggregation?.addCommand(command);
          }
        });
        break;
      }
      case 'rule': {
        const properties = node.properties as unknown as ViewDSL.RuleDSL;
        const rule = new Rule(properties.uuid, properties, this);

        this.nodesIndexByUUID.set(rule.id, rule);

        this.addPostTraverse(() => {
          if (properties.aggregator) {
            const aggregator = this.nodesIndexByUUID.get(properties.aggregator.referenceId) as Command | undefined;
            aggregator?.rules.push(rule);
          }
        });

        break;
      }
    }
  }
}
