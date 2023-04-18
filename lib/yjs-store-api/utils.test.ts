import { readBufferFromReadableStream } from './utils';
import { PassThrough } from 'stream';

test('readBufferFromReadableStream', async () => {
  const readable = new PassThrough();
  const buffer = readBufferFromReadableStream(readable);

  readable.push(Buffer.from('hello'));
  readable.push(Buffer.from(' '));
  readable.push(Buffer.from('world'));
  readable.end();

  expect((await buffer).toString()).toBe('hello world');
});
