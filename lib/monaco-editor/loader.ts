function loadScript() {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'monaco/min/vs/loader.js';

    script.onload = () => {
      resolve();
    };

    script.onerror = evt => {
      console.error(evt);
      reject('加载 monaco 失败');
    };
  });
}
/**
 * 加载 monaco
 */
export async function loadMonaco() {
  if (window.monaco != null) {
    return;
  }

  await loadScript();

  // @ts-expect-error
  window.require.config({
    paths: { vs: 'monaco/min/vs' },
  });

  // @ts-expect-error
  window.require.config({
    'vs/nls': {
      availableLanguages: {
        '*': 'zh-cn',
      },
    },
  });

  return await new Promise<void>(res => {
    // @ts-expect-error
    window.require(['vs/editor/editor.main'], () => {
      res();
    });
  });
}
