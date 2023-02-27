import { NoopArray, upperFirst } from '@wakeapp/utils';
import lowerFirst from 'lodash/lowerFirst';
import memoize from 'lodash/memoize';
import Fuse from 'fuse.js';
import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';

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
  protected override fuse: Fuse<string> = new Fuse([], { includeScore: true, minMatchCharLength: 2, threshold: 0.48 });

  /**
   * 获取过滤字段(用于查询的字符串)
   * @param value
   */
  abstract getFilter(value: string): string[];

  abstract transform(value: string): string;

  override search(value: string): string[] {
    value = value.trim();
    if (!value) {
      return NoopArray;
    }

    const filter = this.getFilter(value);

    if (filter.length === 0) {
      return NoopArray;
    }

    const matched = new Map<string, number>();
    const sections: string[] = filter.slice(0);
    const prefix: string[] = [];

    while (sections.length) {
      const query = sections.join('-');
      const result = this.fuse.search(query);
      const prefixInString = prefix.join('-');

      for (const { item, score } of result) {
        const value = this.transform(prefixInString ? prefixInString + '-' + item : item);
        matched.set(value, score as number);
      }

      const next = sections.shift();
      if (next) {
        prefix.push(next);
      }
    }

    return Array.from(matched)
      .sort((a, b) => a[1] - b[1])
      .map(i => i[0]);
  }
}

export class CompletionImplementIdentifierUpperSnakeCase extends CompletionImplementIdentifier {
  protected normalize = memoize((value: string) => {
    if (value.includes('-')) {
      return value.split('-').join('_');
    }

    return value;
  });
  transform(value: string): string {
    return this.normalize(value).toUpperCase();
  }

  getFilter(value: string): string[] {
    return value.split('_');
  }
}

export class CompletionImplementIdentifierLowerSnakeCase extends CompletionImplementIdentifierUpperSnakeCase {
  override transform(value: string): string {
    return super.transform(value).toLowerCase();
  }
}

export class CompletionImplementIdentifierUpperCamelCase extends CompletionImplementIdentifier {
  protected normalize = memoize((value: string) => {
    if (value.includes('-')) {
      return camelCase(value);
    }

    return value;
  });

  transform(value: string): string {
    return upperFirst(this.normalize(value));
  }

  getFilter(value: string): string[] {
    return snakeCase(value).split('_');
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
