/**
 * 从 GPT 返回的结果中解析出指令
 */
import trimStart from 'lodash/trimStart';
import trimEnd from 'lodash/trimEnd';

const DELIMITER = '%%';
const DIRECTIVE_REG = /%%(.+?)%%/gm;

export interface Directive {
  type: string;
  params: Record<string, any>;
}

export function parseItem(text: string): Directive | null {
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

  const params = sections.reduce<Record<string, any>>((acc, item) => {
    const [key, value] = item.split('=');

    const rawValue = trimStart(trimEnd(value, '"'), '"');
    acc[key] = rawValue;

    return acc;
  }, {});

  const dir: Directive = {
    type: directive,
    params,
  };

  return dir;
}

/**
 * 解析指令
 * @param input
 * @returns
 */
export function parse(input: string): Directive[] | null {
  if (!input.includes(DELIMITER)) {
    return null;
  }

  const matched = input.match(DIRECTIVE_REG);

  if (!matched) {
    return null;
  }

  const directives: Directive[] = [];

  for (const item of matched) {
    const directive = parseItem(item);
    if (directive) {
      directives.push(directive);
    }
  }

  return directives.length ? directives : null;
}
