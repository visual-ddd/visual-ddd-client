import { verifyRedirect } from './utils';

test('verifyRedirect', () => {
  expect(verifyRedirect('/system', { isSysAdmin: true } as any)).toBe(true);
  expect(verifyRedirect('/system', { isSysAdmin: false } as any)).toBe(false);
  expect(
    verifyRedirect('/organization/1', { accountOrganizationInfoList: [{ organizationDTO: { id: 1 } }] } as any)
  ).toBe(true);
  expect(
    verifyRedirect('/organization/2', { accountOrganizationInfoList: [{ organizationDTO: { id: 1 } }] } as any)
  ).toBe(false);
  expect(verifyRedirect('/team/1', { teamDTOList: [{ teamDTO: { id: 1 } }] } as any)).toBe(true);
  expect(verifyRedirect('/team/2', { teamDTOList: [{ teamDTO: { id: 1 } }] } as any)).toBe(false);

  // 未知
  expect(verifyRedirect('/unknown', { teamDTOList: [{ teamDTO: { id: 1 } }] } as any)).toBe(false);
});
