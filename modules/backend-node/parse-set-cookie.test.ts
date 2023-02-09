import { parseSetCookie } from './parse-set-cookie';

test('parseSetCookie', () => {
  expect(
    parseSetCookie(
      'visualJsid=f2e1a7eea23c4be0b33b5014762cf692; Path=/; HttpOnly, JSESSIONID=5981840E84A2A194A4D3A8937D664DF7; Path=/wd/visual; HttpOnly'
    )
  ).toEqual({
    JSESSIONID: '5981840E84A2A194A4D3A8937D664DF7',
    visualJsid: 'f2e1a7eea23c4be0b33b5014762cf692',
  });
});
