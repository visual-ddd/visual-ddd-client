export function generateComment(lines: (string | undefined)[], style: 'block' | 'inline') {
  const comments = lines.filter(i => i != null && i !== '');

  if (!comments.length) {
    return '';
  }

  const codeLines: string[] = [];

  if (style === 'block') {
    codeLines.push('/**');
    comments.forEach(i => codeLines.push(` * ${i}`));
    codeLines.push(' */');
  } else {
    comments.forEach(i => codeLines.push(`// ${i}`));
  }

  return codeLines.join('\n');
}
