const MENTION_REGEX = /^#([^\s#]+)/;

/**
 * 从字符串中提取插件 ID
 * @param str
 * @returns
 */
export function extraMention(str: string) {
  if (str.charAt(0) !== '#') {
    return null;
  }

  const matched = str.match(MENTION_REGEX);
  if (matched) {
    return matched[1];
  }

  return null;
}
