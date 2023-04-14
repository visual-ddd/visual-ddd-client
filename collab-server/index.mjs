// @ts-check
import { Server } from '@hocuspocus/server';
import { Logger } from '@hocuspocus/extension-logger';

const MAIN_SERVER = process.env.MAIN_SERVER;
const END_POINT = '/api/rest/session';

const SHOULD_AUTH = !!MAIN_SERVER;

const server = Server.configure({
  name: 'visual-ddd',
  port: 8080,
  extensions: [new Logger()],
  async onConnect(data) {
    if (SHOULD_AUTH && !data.connection.isAuthenticated) {
      throw new Error('Need to authenticate, you should provide token');
    }
  },
  async onAuthenticate(data) {
    data.connection.isAuthenticated = true;

    if (!SHOULD_AUTH) {
      return;
    }

    const url = new URL(END_POINT, MAIN_SERVER);
    const result = await fetch(url, {
      headers: {
        cookie: data.requestHeaders.cookie,
      },
    });

    if (result.ok) {
      const json = /** @type {{data: {user: any } }} */ (await result.json());

      return json;
    }

    throw new Error('Not authenticated');
  },
});

server.listen();
