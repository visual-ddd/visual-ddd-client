import { createInviteCode, parseInviteCode } from './invite-code';

test('createInviteCode', async () => {
  const data = { type: 'user', id: 'test', date: 1234567890 } as const;
  const code = await createInviteCode(data);
  expect(code).toBe('754951c81e5e8149744220883e2c9aae2c1cef5be43dee2025b382c91ef3aa197e487b0973a43a4547ffcde50760bb84');
  const parsed = await parseInviteCode(code);

  expect(parsed).toEqual(data);
});

test('parseInviteCode', async () => {
  const code = '754951c81e5e8149744220883e2c9aae2c1cef5be43dee2025b382c91ef3aa197e487b0973a43a4547ffcde50760bb84';
  const parsed = await parseInviteCode(code);

  expect(parsed).toEqual({ type: 'user', id: 'test', date: 1234567890 });

  expect(parseInviteCode('123')).rejects.toThrow();
});
