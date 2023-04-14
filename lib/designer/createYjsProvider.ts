import type { Doc as YDoc } from 'yjs';
import type { Awareness } from 'y-protocols/awareness';
import { WebrtcProvider } from 'y-webrtc';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { IndexeddbPersistence } from 'y-indexeddb';

/**
 * 建立本地缓存
 * @param options
 */
export async function createYjsLocalProvider(options: { id: string; doc: YDoc }) {
  const { id, doc } = options;
  const name = `visual-ddd-${id}`;

  const provider = new IndexeddbPersistence(name, doc);

  return new Promise(resolve => {
    provider.once('synced', resolve);
  });
}

export interface YjsProviderOptions {
  id: string;
  doc: YDoc;
  awareness: Awareness;

  /**
   * 已连接
   * @returns
   */
  onConnected?: () => void;

  /**
   * 错误状态
   * @param error
   * @returns
   */
  onError?: (error: Error) => void;

  /**
   * 断开
   */
  onClose?: () => void;
}

export type YjsProviderDisposer = () => void;

function getRoomName(id: string) {
  return `${process.env.NODE_ENV}-visual-ddd-${id}`;
}

/**
 * 建立远程同步器
 * @deprecated
 * @param options
 * @returns
 */
export function createWebrtcYjsProvider(options: YjsProviderOptions): YjsProviderDisposer {
  const { id, doc, awareness } = options;
  const roomName = getRoomName(id);

  let SELF_HOST: URL;

  if (process.env.NODE_ENV === 'development') {
    // 开发环境直接转发到 BACKEND
    SELF_HOST = new URL('https://ddd.wakedt.cn');
  } else {
    // 生产环境，在同一个域下
    SELF_HOST = new URL(location.href);
  }

  SELF_HOST.protocol = 'wss:';
  SELF_HOST.pathname = '/signaling';
  SELF_HOST.search = '';

  const prov = new WebrtcProvider(roomName, doc, {
    signaling: [
      SELF_HOST.href,

      // y-webrtc 会尝试同时连接这些服务器
      // yjs 默认
      // 'wss://signaling.yjs.dev',
      // 'wss://y-webrtc-signaling-eu.herokuapp.com',
      // 'wss://y-webrtc-signaling-us.herokuapp.com',
    ],
    password: 'visual-ddd',
    awareness: awareness,
  });

  let destroyed = false;

  return () => {
    if (destroyed) {
      return;
    }

    destroyed = true;
    prov.destroy();
  };
}

/**
 * 创建远程同步器
 * @param options
 * @returns
 */
export function createHocuspocusYjsProvider(options: YjsProviderOptions): YjsProviderDisposer {
  const { id, doc, awareness, onConnected, onClose, onError } = options;
  const roomName = getRoomName(id);

  let SELF_HOST: URL;

  if (process.env.NODE_ENV === 'development') {
    // 开发环境直接转发到 BACKEND
    SELF_HOST = new URL('http://localhost:9090');
  } else {
    // 生产环境，在同一个域下
    SELF_HOST = new URL(location.href);
  }

  SELF_HOST.protocol = SELF_HOST.protocol === 'https:' ? 'wss:' : 'ws:';
  SELF_HOST.pathname = '/collaboration';
  SELF_HOST.search = '';

  let retryTime = 0;

  // Connect it to the backend
  const provider = new HocuspocusProvider({
    url: SELF_HOST.href,
    name: roomName,
    document: doc,
    awareness: awareness,
    // 需要显式提供 token 才能触发 onAuthenticate
    token: 'TALK is cheap. SHOW me the code.',
    onClose() {
      retryTime++;
      if (retryTime > 3 && window.navigator.onLine) {
        onError?.(new Error('连接服务器失败'));
      } else {
        onClose?.();
      }
    },
    onAuthenticationFailed() {
      onError?.(new Error('鉴权失败'));
    },
    onConnect() {
      onConnected?.();
      retryTime = 0;
    },
  });

  let destroyed = false;

  return () => {
    if (destroyed) {
      return;
    }

    destroyed = true;
    provider.destroy();
  };
}

export { createHocuspocusYjsProvider as createYjsProvider };
