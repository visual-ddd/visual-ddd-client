import { IMMUTABLE_REQUEST_CONFIG, useRequestByGet } from '@/modules/backend-client';
import { debounce, NoopArray } from '@wakeapp/utils';
import { Select, SelectProps } from 'antd';
import { memo, useMemo, useState } from 'react';

import { UserItem } from '../types';

export interface UserSelectProps extends SelectProps {
  filter?: (item: UserItem) => boolean;
}

/**
 * 用户选择器
 */
export const UserSelect = memo((props: UserSelectProps) => {
  const { filter, ...other } = props;
  const [query, setQuery] = useState<string>('');

  // 搜索列表
  const { isLoading, data } = useRequestByGet<UserItem[]>(
    `/wd/visual/web/account/account-page-query?pageNo=1&pageSize=20&userName=${query}`,
    undefined,
    IMMUTABLE_REQUEST_CONFIG
  );

  // 当前值
  const { data: currentUser } = useRequestByGet(
    props.value != null ? `/wd/visual/web/account/account-detail-query?id=${props.value}` : null,
    undefined,
    IMMUTABLE_REQUEST_CONFIG
  );

  const options = useMemo(() => {
    const list = data ?? NoopArray;
    if (!currentUser) {
      return list;
    }

    if (list.some(item => item.id === currentUser.id)) {
      return list;
    }

    return list.concat([currentUser]);
  }, [currentUser, data]);

  const filtered = useMemo(() => {
    if (filter) {
      return options.filter(filter);
    }

    return options;
  }, [filter, options]);

  const handleSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQuery(value);
      }, 400),
    [setQuery]
  );

  return (
    <Select
      loading={isLoading}
      showSearch
      onSearch={handleSearch}
      filterOption={false}
      showArrow={false}
      options={filtered.map(item => ({
        key: item.id,
        label: item.userName,
        value: item.id,
      }))}
      {...other}
    />
  );
});

UserSelect.displayName = 'UserSelect';
