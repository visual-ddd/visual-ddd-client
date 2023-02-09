import gravatarUrl from 'gravatar-url';
import memoize from 'lodash/memoize';

export const getGravatarUrl = memoize((mail: string) => {
  return gravatarUrl(mail, { size: 200 });
});
