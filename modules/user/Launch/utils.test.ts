import { VDSessionEntry } from '@/modules/session/types';
import { verifyRedirect, getOrganizationIdFromPath } from './utils';

test('getOrganizationIdFromPath', () => {
  expect(getOrganizationIdFromPath('test')).toBe(undefined);
  expect(getOrganizationIdFromPath('/organization/123')).toBe('123');
  expect(getOrganizationIdFromPath('/organization/123/hello')).toBe('123');
});

test('await verifyRedirect', async () => {
  expect(await verifyRedirect('/system', { isSysAdmin: true } as any)).toEqual({
    entry: VDSessionEntry.System,
    entryName: '系统管理',
    isManager: true,
  });
  expect(await verifyRedirect('/system', { isSysAdmin: false } as any)).toBe(undefined);
  expect(
    await verifyRedirect('/organization/1', {
      accountOrganizationInfoList: [{ organizationDTO: { id: 1, name: 'hello' } }],
    } as any)
  ).toEqual({
    entry: VDSessionEntry.Organization,
    entryName: 'hello',
    isManager: true,
    entryId: 1,
  });

  // 系统管理员可以进入任何组织
  expect(
    await verifyRedirect('/organization/1', {
      accountOrganizationInfoList: [{ organizationDTO: { id: 1, name: 'hello' } }],
      isSysAdmin: true,
    } as any)
  ).toEqual({
    entry: VDSessionEntry.Organization,
    entryName: 'hello',
    isManager: true,
    entryId: 1,
  });

  // 系统管理员可以进入任何组织
  expect(
    await verifyRedirect('/organization/2', {
      accountOrganizationInfoList: [{ organizationDTO: { id: 1, name: 'hello' } }],
      isSysAdmin: true,
    } as any)
  ).toEqual({
    entry: VDSessionEntry.Organization,
    entryName: '组织-2',
    isManager: true,
    entryId: '2',
  });

  expect(
    await verifyRedirect('/organization/2', { accountOrganizationInfoList: [{ organizationDTO: { id: 1 } }] } as any)
  ).toBe(undefined);
  expect(
    await verifyRedirect('/team/1', { accountTeamInfoList: [{ teamDTO: { id: 1, name: 'hello' } }] } as any)
  ).toEqual({
    entry: VDSessionEntry.Team,
    entryName: 'hello',
    isManager: false,
    entryId: 1,
  });

  expect(await verifyRedirect('/team/2', { accountTeamInfoList: [{ teamDTO: { id: 1 } }] } as any)).toBe(undefined);
  // 如果是系统管理员，可以进入所有团队
  expect(
    await verifyRedirect('/team/2', { isSysAdmin: true, accountTeamInfoList: [{ teamDTO: { id: 1 } }] } as any)
  ).toEqual({
    entry: 'team',
    entryId: '2',
    entryName: '团队-2',
    isManager: true,
  });

  // 如果是团队管理员，可以进入任何团队
  const getTeamInfo = jest.fn(() =>
    Promise.resolve({
      name: '我的团队',
      id: 1,
      organizationId: 1,
    })
  );
  expect(
    await verifyRedirect(
      '/team/1',
      { accountOrganizationInfoList: [{ organizationDTO: { id: 1 } }] } as any,
      getTeamInfo as any
    )
  ).toEqual({
    entry: VDSessionEntry.Team,
    entryName: '我的团队',
    isManager: true,
    entryId: 1,
  });
  expect(getTeamInfo).toBeCalledWith('1');

  // 未知
  expect(await verifyRedirect('/unknown', { accountTeamInfoList: [{ teamDTO: { id: 1 } }] } as any)).toBe(undefined);
});
