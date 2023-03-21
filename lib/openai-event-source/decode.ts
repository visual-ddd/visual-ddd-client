import JSON5 from 'json5';

const isValidStartChar = (char: string) => {
  return char === '{' || char === '[' || char === '"';
};

const isValidEndChar = (char: string) => {
  return char === '}' || char === ']' || char === '"';
};

/**
 * trim
 * @param json
 * @returns
 */
export function looseJSONParse<T = any>(json: string): T {
  let validStartIndex = 0;
  let validEndIndex = json.length - 1;

  while (validStartIndex < json.length) {
    const char = json[validStartIndex];
    if (isValidStartChar(char)) {
      break;
    }
    validStartIndex++;
  }

  while (validEndIndex >= 0) {
    const char = json[validEndIndex];
    if (isValidEndChar(char)) {
      break;
    }
    validEndIndex--;
  }

  json = json.slice(validStartIndex, validEndIndex + 1);

  return JSON5.parse(json);
}
