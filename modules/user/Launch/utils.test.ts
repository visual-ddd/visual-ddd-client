import { VDSessionEntry } from '@/modules/session/types';
import { verifyRedirect } from './utils';

test('verifyRedirect', () => {
  expect(verifyRedirect('/system', { isSysAdmin: true } as any)).toEqual({
    entry: VDSessionEntry.System,
    entryName: '系统管理',
    isManager: true,
  });
  expect(verifyRedirect('/system', { isSysAdmin: false } as any)).toBe(undefined);
  expect(
    verifyRedirect('/organization/1', {
      accountOrganizationInfoList: [{ organizationDTO: { id: 1, name: 'hello' } }],
    } as any)
  ).toEqual({
    entry: VDSessionEntry.Organization,
    entryName: 'hello',
    isManager: true,
    entryId: 1,
  });
  expect(
    verifyRedirect('/organization/2', { accountOrganizationInfoList: [{ organizationDTO: { id: 1 } }] } as any)
  ).toBe(undefined);
  expect(verifyRedirect('/team/1', { teamDTOList: [{ teamDTO: { id: 1, name: 'hello' } }] } as any)).toEqual({
    entry: VDSessionEntry.Team,
    entryName: 'hello',
    isManager: false,
    entryId: 1,
  });
  expect(verifyRedirect('/team/2', { teamDTOList: [{ teamDTO: { id: 1 } }] } as any)).toBe(undefined);

  // 未知
  expect(verifyRedirect('/unknown', { teamDTOList: [{ teamDTO: { id: 1 } }] } as any)).toBe(undefined);
});
