import { DataObjectDSL, DataObjectTypeDSL, DataObjectTypeName, DataObjectPropertyDSL } from '../dsl/dsl';
import { NameDSL } from '../../domain-design/dsl/dsl';
import { UntitledInHumanReadable } from '../../domain-design/dsl/constants';
import snakeCase from 'lodash/snakeCase';
import { assert } from '@/lib/utils';

function getTableName(table: DataObjectDSL) {
  return table.tableName || snakeCase(table.name);
}

function getPropertyName(property: DataObjectPropertyDSL) {
  return property.propertyName || snakeCase(property.name);
}

function stringifyType(type: DataObjectTypeDSL, tables: DataObjectDSL[]) {
  if (type.type !== DataObjectTypeName.Reference) {
    return type.type;
  }

  const refTable = tables.find(i => i.uuid === type.target);

  assert(refTable, `未找到引用的数据表 ${type.target}`);

  const refProperty = refTable.properties.find(i => i.uuid === type.targetProperty);

  assert(refProperty, `未找到引用的数据表 ${refTable.name} 的属性 ${type.targetProperty}`);

  return `${type.type}(${getTableName(refTable)}.${getPropertyName(refProperty)})`;
}

function getComment(data: NameDSL) {
  if (data.title && !data.title.includes(UntitledInHumanReadable)) {
    return data.title;
  }
  return undefined;
}

function stringifyProperty(property: DataObjectPropertyDSL, table: DataObjectDSL, tables: DataObjectDSL[]): string {
  const type = stringifyType(property.type, tables);
  const modifier: string[] = [];

  if (property.primaryKey) {
    modifier.push('PrimaryKey');
  } else if (property.notNull) {
    modifier.push('NotNull');
  }

  // TODO: 支持默认值
  const comment = getComment(property);

  return `  ${getPropertyName(property)}: ${type}${modifier.length ? ', ' : ''}${modifier.join(', ')};${
    comment ? ` #${comment}` : ''
  }`;
}

function stringifyTable(table: DataObjectDSL, tables: DataObjectDSL[]): string {
  const comment = getComment(table);
  return `${comment ? `#${comment}\n` : ''}Table ${getTableName(table)} (\n${table.properties
    .map(i => {
      return stringifyProperty(i, table, tables);
    })
    .join('\n')}
)`;
}

function stringifyIndex(table: DataObjectDSL): string {
  if (table.indexes.length) {
    let dsl = '';
    for (const index of table.indexes) {
      if (!index.properties.length) {
        continue;
      }

      const idx = `Index ${getTableName(table)}.${index.name} (
	type: ${index.type};
	method: ${index.method};
	fields: ${index.properties
    .map(p => {
      const property = table.properties.find(i => i.uuid === p);
      assert(property, `未找到属性 ${p}`);

      return getPropertyName(property);
    })
    .join(', ')};
)`;
      dsl += idx + '\n\n';
    }

    return dsl;
  }

  return '';
}

/**
 * 将数据表 DSL 转换为 AI 容易识别的，简洁的格式
 */
export function transform(tables: DataObjectDSL[], allTables: DataObjectDSL[]): string {
  let dsl = '';

  for (const table of tables) {
    const tbl = stringifyTable(table, allTables);
    const index = stringifyIndex(table);

    dsl += `${tbl}\n\n${index}`;
  }

  return dsl;
}
