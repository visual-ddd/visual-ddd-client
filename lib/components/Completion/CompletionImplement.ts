import { NoopArray, upperFirst } from '@wakeapp/utils';
import lowerFirst from 'lodash/lowerFirst';
import Fuse from 'fuse.js';

/**
 * 最简单提示实现
 */
export class CompletionImplement {
  protected fuse: Fuse<string> = new Fuse([]);

  /**
   * 搜索
   * @param value
   * @returns
   */
  search(value: string): string[] {
    if (!value.trim()) {
      return NoopArray;
    }

    return this.fuse.search(value).map(i => i.item);
  }

  setCandidate(words: string[]) {
    this.fuse.setCollection(words);
  }
}

/**
 * 标识符提示实现
 */
export abstract class CompletionImplementIdentifier extends CompletionImplement {
  /**
   * 获取过滤字段
   * @param value
   */
  abstract getFilter(value: string): string;

  abstract transform(value: string): string;

  override search(value: string): string[] {
    value = value.trim();
    if (!value) {
      return NoopArray;
    }

    const filter = this.getFilter(value);

    if (!filter) {
      return NoopArray;
    }

    const result = this.fuse.search(filter);

    const prefix = value.slice(0, -filter.length);

    return result.map(i => prefix + this.transform(i.item));
  }
}

export class CompletionImplementIdentifierUpperSnakeCase extends CompletionImplementIdentifier {
  transform(value: string): string {
    return value.toUpperCase();
  }

  getFilter(value: string): string {
    const idx = value.lastIndexOf('_');
    if (idx === -1) {
      return value;
    }

    return value.slice(idx + 1);
  }
}

export class CompletionImplementIdentifierLowerSnakeCase extends CompletionImplementIdentifierUpperSnakeCase {
  override transform(value: string): string {
    return value.toLowerCase();
  }
}

export class CompletionImplementIdentifierUpperCamelCase extends CompletionImplementIdentifier {
  transform(value: string): string {
    return upperFirst(value);
  }

  getFilter(value: string): string {
    for (let i = value.length - 1; i >= 0; i--) {
      const char = value[i];
      if (/[A-Z_$]/.test(char)) {
        return value.slice(i);
      }
    }

    return value;
  }

  override search(value: string): string[] {
    const result = super.search(value);
    return result.map(upperFirst);
  }
}

export class CompletionImplementIdentifierLowerCamelCase extends CompletionImplementIdentifierUpperCamelCase {
  override search(value: string): string[] {
    const result = super.search(value);
    return result.map(lowerFirst);
  }
}
