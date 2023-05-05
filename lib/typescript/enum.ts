import { assert } from '@/lib/utils';
import { generateComment } from './comment';
import { Comment } from './types';
import { indent } from './utils';

export interface EnumDescription {
  comment?: Comment;
  name: string;
  member: {
    name: string;
    code?: string | number;
    comment?: Comment;
  }[];
}

/**
 * 生成枚举
 * @param description
 */
export function generateEnum(description: EnumDescription) {
  assert(description.name, '枚举名称不能为空');

  const codes: string[] = [];

  if (description.comment) {
    codes.push(generateComment([description.comment.title, description.comment.description], 'block'));
  }

  codes.push(`enum ${description.name} {`);

  description.member.forEach(i => {
    const cs: string[] = [];

    assert(i.name, '枚举成员名称不能为空');

    if (i.comment) {
      cs.push(generateComment([i.comment.title, i.comment.description], 'block'));
    }
    cs.push(`${i.name}${i.code != null ? ` = ${typeof i.code === 'string' ? `'${i.code}'` : i.code}` : ''},`);

    codes.push(indent(cs.filter(Boolean).join('\n')));
  });

  codes.push('}');

  return codes.join('\n');
}
