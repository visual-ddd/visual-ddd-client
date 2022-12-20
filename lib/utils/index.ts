export * from './EventBus';
export * from './promise';
export * from './object';

export function makeSet(contentSplitByComma: string) {
  return new Set<string>(contentSplitByComma.split(',').map(i => i.trim()));
}
