import { calculateContext } from './chat-context';
import { Message, Role } from './protocol';

jest.mock('./tokenizer', () => {
  return {
    __esModule: true,
    getTokenCount: jest.fn().mockImplementation((content: string) => {
      return Promise.resolve(content.length);
    }),
  };
});

const createMessage = (content: string, summary?: string, token?: number): Message => {
  return {
    uuid: '123',
    role: Role.User,
    content,
    summary,
    timestamp: Date.now(),
    token,
  };
};

describe('calculateContext', () => {
  test('should return empty list, if prompt exceed', async () => {
    expect(await calculateContext('x'.repeat(4000), [])).toEqual({
      prompt: expect.anything(),
      messages: [],
      promptToken: 4000,
      token: 4000,
    });
  });

  test('should stop on meet summary', async () => {
    const message = [
      createMessage('1'.repeat(500)),
      createMessage('2'.repeat(100), '3'.repeat(50)),
      createMessage('4'.repeat(100), undefined, 95),
      createMessage('5'.repeat(200)),
    ];
    expect(await calculateContext('x'.repeat(2), message)).toEqual({
      prompt: expect.anything(),
      messages: [message[1], message[2], message[3]],
      promptToken: 2,
      token: 200 + 95 + 50 + 2,
    });
  });

  test('should stop on meet max length', async () => {
    const messages = new Array(20).fill(0).map((_, idx) => {
      return createMessage('x');
    });
    expect(await calculateContext('', messages)).toEqual({
      prompt: expect.anything(),
      messages: messages.slice(-8),
      promptToken: 0,
      token: 8,
    });
  });

  test('should return recommend Summary Message', async () => {
    const messages = [
      createMessage('1'.repeat(500)),
      createMessage('2'.repeat(500)),
      createMessage('3'.repeat(500)),
      createMessage('4'.repeat(500)),
      createMessage('5'.repeat(500)),
      createMessage('6'.repeat(500)),
    ];

    expect(await calculateContext('7'.repeat(500), messages)).toEqual({
      prompt: expect.anything(),
      messages: messages.slice(-4),
      recommendToSummary: messages[1],
      promptToken: 500,
      token: 2500,
    });
  });
});
