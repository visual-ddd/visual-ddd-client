export * from './EventBus';
export * from './promise';
export * from './object';
export * from './IDisposable';
export * from './KeyboardBinding';
export * from './filter';
export * from './color';
export * from './url';
export * from './Clipboard';
export * from './assert';
export * from './name-case';
export * from './array';

export function makeSet(contentSplitByComma: string) {
  return new Set<string>(contentSplitByComma.split(',').map(i => i.trim()));
}
