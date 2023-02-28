import gravatarUrl from 'gravatar-url';
import memoize from 'lodash/memoize';

export const getGravatarUrl = memoize((mail: string) => {
  const url = gravatarUrl(mail, {
    size: 200,
  });

  // 使用七牛云
  return url.replace('gravatar.com', 'dn-qiniu-avatar.qbox.me');
});
