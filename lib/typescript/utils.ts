/**
 * 将指定代码进行缩进
 * @param code
 * @param count
 */
export function indent(code: string, count: number = 1) {
  if (!code) {
    return code;
  }

  const lines = code.split('\n');
  const spaces = '  '.repeat(count);
  const result = lines.map(i => `${spaces}${i}`);
  return result.join('\n');
}
