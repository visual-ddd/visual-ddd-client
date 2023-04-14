/**
 * 从 GPT 返回的结果中解析出指令
 */
import trimStart from 'lodash/trimStart';
import trimEnd from 'lodash/trimEnd';
import {
  DirectiveName,
  GroupedTransformDirectives,
  TransformDirective,
  getTableName,
  isAvailableDirective,
  RenameFieldDirective,
  isTableDirective,
  TableFieldReference,
  isFieldDirective,
} from './protocol';
import { NoopArray } from '@wakeapp/utils';
import { normalizedCamelCase } from '@/lib/utils';

const DELIMITER = '%%';
const DIRECTIVE_REG = /%%(.+)%%/gm;

function normalizedValue(value: string) {
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  }

  return value;
}

/**
 * 规范化指令命名
 * @param dir
 */
function normalizeDirective(dir: TransformDirective) {
  if (isTableDirective(dir)) {
    dir.params.name = normalizedCamelCase(dir.params.name, true);

    if (dir.type === DirectiveName.RenameTable) {
      dir.params.newName = normalizedCamelCase(dir.params.newName, true);
    }
  }

  if (isFieldDirective(dir)) {
    dir.params.table = normalizedCamelCase(dir.params.table, true);
    dir.params.name = normalizedCamelCase(dir.params.name);

    if (dir.type === DirectiveName.RenameField) {
      dir.params.newName = normalizedCamelCase(dir.params.newName);
    } else if (
      (dir.type === DirectiveName.AddField || dir.type === DirectiveName.UpdateField) &&
      dir.params.reference
    ) {
      let { table, field } = parseReference(dir.params.reference);
      table = normalizedCamelCase(table, true);
      field = normalizedCamelCase(field);

      dir.params.reference = `${table}.${field}`;
    }
  }

  return dir;
}

function parseItem(text: string): TransformDirective | null {
  if (!text) {
    return null;
  }

  const sections = trimEnd(trimStart(text, DELIMITER), DELIMITER)
    .split(' ')
    .map(i => i.trim())
    .filter(Boolean);
  const directive = sections.shift();

  if (!directive) {
    return null;
  }

  if (!isAvailableDirective(directive)) {
    console.warn(`Unknown directive: ${directive}`);
    return null;
  }

  const params = sections.reduce<Record<string, any>>((acc, item) => {
    const [key, value] = item.split('=');

    const rawValue = trimStart(trimEnd(value, '"'), '"');
    acc[key] = normalizedValue(rawValue);

    return acc;
  }, {});

  const dir = {
    type: directive,
    params,
  } as TransformDirective;

  normalizeDirective(dir);

  return dir;
}

export function parse(input: string): TransformDirective[] | null {
  if (!input.includes(DELIMITER)) {
    return null;
  }

  const matched = input.match(DIRECTIVE_REG);

  if (!matched) {
    return null;
  }

  const directives: TransformDirective[] = [];

  for (const item of matched) {
    const directive = parseItem(item);
    if (directive) {
      directives.push(directive);
    }
  }

  return directives.length ? directives : null;
}

export function parseReference(id: TableFieldReference) {
  const [table, field] = id
    .trim()
    .split('.')
    .map(i => i.trim());

  return {
    table,
    field,
  };
}

/**
 * 分组指令
 * @param directives
 * @returns
 */
export function groupByTable(directives: TransformDirective[]): GroupedTransformDirectives[] {
  const grouped: Map<string, GroupedTransformDirectives> = new Map();
  /**
   * 被重命名的表格，需要进行合并
   */
  const tableRenamed: Map<string, string> = new Map();

  for (const directive of directives) {
    const tableName = getTableName(directive);
    let group = grouped.get(tableName);

    if (group == null) {
      group = {
        table: tableName,
        tableDirectives: [],
        fieldDirectives: [],
      };
      grouped.set(tableName, group);
    }

    if (isTableDirective(directive)) {
      group.tableDirectives.push(directive);
      if (directive.type === DirectiveName.RenameTable) {
        // 表格进行了重命名, 记录一下
        tableRenamed.set(directive.params.name, directive.params.newName);
      }
    } else {
      group.fieldDirectives.push(directive);
    }
  }

  // 后处理，对重命名的表格进行合并
  if (tableRenamed.size) {
    for (const [name, newName] of tableRenamed.entries()) {
      const groupByName = grouped.get(name);
      const groupByNewName = grouped.get(newName);

      if (groupByNewName == null) {
        continue;
      }

      const newGroup: GroupedTransformDirectives = {
        table: name,
        tableDirectives: [
          ...(groupByName?.tableDirectives ?? NoopArray),
          ...(groupByNewName?.tableDirectives ?? NoopArray),
        ],
        fieldDirectives: [
          ...(groupByName?.fieldDirectives ?? NoopArray),
          ...(groupByNewName?.fieldDirectives ?? NoopArray),
        ],
      };

      grouped.delete(newName);
      grouped.set(name, newGroup);
    }
  }

  // 后处理，对重命名的字段进行规范化
  // 让字段可能被跟踪
  for (const group of grouped.values()) {
    const list = group.fieldDirectives;

    const renameDirectives = list.filter((i): i is RenameFieldDirective => i.type === DirectiveName.RenameField);

    if (!renameDirectives.length) {
      continue;
    }

    // map newName -> name
    const mapper = renameDirectives.reduce<Record<string, string>>((acc, cur) => {
      acc[cur.params.newName] = cur.params.name;

      return acc;
    }, {});

    // 修正
    for (const dir of list) {
      if (dir.type !== DirectiveName.RenameField && dir.params.name in mapper) {
        dir.params.name = mapper[dir.params.name];
      }

      if ((dir.type === DirectiveName.UpdateField || dir.type === DirectiveName.AddField) && dir.params.reference) {
        // 修正引用
        const { table, field } = parseReference(dir.params.reference);
        if (table in mapper) {
          dir.params.reference = `${mapper[table]}.${field}`;
        }
      }
    }
  }

  return Array.from(grouped.values());
}
