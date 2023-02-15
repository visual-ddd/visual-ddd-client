import { debounce, NoopArray } from '@wakeapp/utils';
import { message, Select, SelectProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { request } from '@/modules/backend-client';

import { DEFAULT_ROLE, MemberRoleOptions, TeamMemberRole } from '../types';

export interface RoleSelectProps extends SelectProps {
  teamId: number;
  memberId: number;
}

export function isRolesEqual(a: TeamMemberRole[], b: TeamMemberRole[]) {
  return a.length === b.length && a.every(i => b.includes(i));
}

export const RoleSelect = (props: RoleSelectProps) => {
  const { teamId, memberId, value, onChange, ...other } = props;
  const [cacheValue, setCacheValue] = useState<TeamMemberRole[]>(NoopArray);

  // 更新状态
  useEffect(() => {
    if (!isRolesEqual(value ?? NoopArray, cacheValue)) {
      setCacheValue(value ?? NoopArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /**
   * 绑定团队成员职位
   * @param value
   */
  const handleChangeRole = useMemo(
    () =>
      debounce(async (memberTypeList: TeamMemberRole[]) => {
        try {
          await request.requestByPost('/wd/visual/web/team-member/team-member-role-bind', {
            memberTypeList,
            id: memberId,
            teamId,
          });
        } catch (err) {
          message.error((err as Error).message);
        }
      }, 1000),
    [teamId, memberId]
  );

  const handleChange = (value?: TeamMemberRole[]) => {
    const newValue = !value?.length ? DEFAULT_ROLE : value;
    if (!isRolesEqual(cacheValue, newValue)) {
      setCacheValue(newValue);
      handleChangeRole(newValue);
    }
  };

  return <Select options={MemberRoleOptions} value={cacheValue} onChange={handleChange} {...other}></Select>;
};
