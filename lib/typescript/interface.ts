import { assert } from '@/lib/utils';
import { Comment } from './types';
import { generateComment } from './comment';
import { indent } from './utils';

export interface InterfaceDescription {
  comment?: Comment;
  /**
   * 名称
   */
  name: string;
  /**
   * 属性
   */
  properties: {
    name: string;
    type: string;
    optional?: boolean;
    comment?: Comment;
  }[];
}

/**
 * 生成接口
 * @param description
 */
export function generateInterface(description: InterfaceDescription) {
  assert(description.name, '接口名称不能为空');

  const codes: string[] = [];

  if (description.comment) {
    codes.push(generateComment([description.comment.title, description.comment.description], 'block'));
  }

  codes.push(`interface ${description.name} {`);

  description.properties.forEach(i => {
    const prop: string[] = [];

    assert(i.name, '属性名称不能为空');
    assert(i.type, '属性类型不能为空');

    if (i.comment) {
      prop.push(generateComment([i.comment.title, i.comment.description], 'block'));
    }

    prop.push(`${i.name}${i.optional ? '?' : ''}: ${i.type};`);

    codes.push(indent(prop.filter(Boolean).join('\n')));
  });

  codes.push(`}`);

  return codes.join('\n');
}
