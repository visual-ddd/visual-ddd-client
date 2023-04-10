import { toNameCase } from '@/lib/utils';
import { AVAILABLE_DIRECTIVES, DirectiveName, ScenarioDirective } from './protocol';
import { parse as parseDirectives } from '@/lib/ai-directive-parser';

function isAvailableDirective(name: string): name is DirectiveName {
  return AVAILABLE_DIRECTIVES.includes(name as any);
}

export function parse(input: string): ScenarioDirective[] | null {
  const results = parseDirectives(input);

  if (results == null) {
    return null;
  }

  const directives: ScenarioDirective[] = [];
  for (const i of results) {
    if (!isAvailableDirective(i.type)) {
      continue;
    }

    if ('x' in i.params) {
      i.params.x = parseInt(i.params.x, 10);
    }

    if ('y' in i.params) {
      i.params.y = parseInt(i.params.y, 10);
    }

    if ('name' in i.params) {
      i.params.name = toNameCase('CamelCase', i.params.name);
    }

    if ('from' in i.params) {
      i.params.from = toNameCase('CamelCase', i.params.from);
    }

    if ('to' in i.params) {
      i.params.to = toNameCase('CamelCase', i.params.to);
    }

    directives.push(i as ScenarioDirective);
  }

  return directives;
}
