import { NoopArray } from '@wakeapp/utils';
import { AutoCompleteProps, AutoComplete } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import { useCompletion } from '@/lib/components/Completion';

export interface TitleInputProps extends AutoCompleteProps {}

/**
 * 标题输入
 * @param props
 * @returns
 */
export const TitleInput = (props: TitleInputProps) => {
  const search = useCompletion();
  const [options, setOptions] = useState<{ value: string; label: string }[]>(NoopArray);

  const handleSearch = (value: string) => {
    const result = search(value);
    setOptions(result.map(i => ({ label: i, value: i })));
  };

  return (
    <AutoComplete
      className={classNames('vd-name-input', 'u-fw')}
      options={options}
      backfill
      onSearch={handleSearch}
      placeholder="使用统一语言(业务术语)起个标题"
      {...props}
    />
  );
};
