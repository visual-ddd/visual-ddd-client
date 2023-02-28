import type { Doc as YDoc } from 'yjs';
import type { Awareness } from 'y-protocols/awareness';
import { WebrtcProvider } from 'y-webrtc';

export function createYjsProvider(options: { id: string; doc: YDoc; awareness: Awareness }) {
  const { id, doc, awareness } = options;
  const roomName = `visual-ddd-${id}`;

  let SELF_HOST: URL;

  if (process.env.NODE_ENV === 'development') {
    // 开发环境直接转发到 BACKEND
    SELF_HOST = new URL(process.env.BACKEND ?? 'https://ddd.wakedt.cn');
  } else {
    // 生产环境，在同一个域下
    SELF_HOST = new URL(location.href);
  }

  SELF_HOST.protocol = 'wss:';
  SELF_HOST.pathname = '/signaling';
  SELF_HOST.search = '';

  return new WebrtcProvider(roomName, doc, {
    signaling: [
      SELF_HOST.href,

      // yjs 默认
      'wss://signaling.yjs.dev',
      'wss://y-webrtc-signaling-eu.herokuapp.com',
      'wss://y-webrtc-signaling-us.herokuapp.com',
    ],
    password: 'visual-ddd',
    awareness: awareness,
  });
}
