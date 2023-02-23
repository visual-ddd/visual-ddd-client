import { Noop } from '@wakeapp/utils';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * 阻止页面关闭
 * @param enable
 */
export function usePreventUnload(enable: boolean = true) {
  const router = useRouter();
  const shouldPrevent = enable && process.env.NODE_ENV === 'production';

  /**
   * 关闭阻止
   */
  useEffect(() => {
    if (!shouldPrevent) {
      return;
    }

    const listener = (evt: Event) => {
      evt.preventDefault();

      // @ts-expect-error
      return (evt.returnValue = '确定关闭吗？');
    };

    window.addEventListener('beforeunload', listener, { capture: true });

    // FIXME: beforePopState 没有销毁方法，只能重置回调
    // 因此这里可能会覆盖其他地方的回调
    router.beforePopState(() => {
      const old = router.asPath;
      const confirm = window.confirm('确定关闭吗？');

      // popState 返回 false, 无法阻止 URL 变更, 这里重置一下
      if (!confirm) {
        router.push(old, undefined, { shallow: true });
      }

      return confirm;
    });

    return () => {
      window.removeEventListener('beforeunload', listener, { capture: true });
      router.beforePopState(Noop);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPrevent]);
}
