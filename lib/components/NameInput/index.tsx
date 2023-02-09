import { NoopArray } from '@wakeapp/utils';
import { AutoCompleteProps, AutoComplete } from 'antd';
import classNames from 'classnames';
import React, { memo, useRef, useState } from 'react';
import { NameTooltipSimple, NameCase } from '@/lib/core';
import { useIdentifierCompletion } from '@/lib/components';

import { valueTransform } from './utils';

export interface NameInputProps extends AutoCompleteProps {
  /**
   * 命名规则，默认为 CamelCase
   */
  nameCase?: NameCase;

  /**
   * 双击启用编辑, 默认关闭
   * 用于需要谨慎变更名称的场景
   */
  dbclickToEnable?: boolean;
}

/**
 * 标识符输入框
 */
export const NameInput = memo((props: NameInputProps) => {
  const { className, value, onChange, dbclickToEnable, nameCase = 'camelCase', onBlur, ...other } = props;
  const [disabled, setDisabled] = useState(!!dbclickToEnable);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(NoopArray);
  const instanceRef = useRef<{ focus: () => void }>(null);
  const search = useIdentifierCompletion(nameCase);

  /**
   * 值变动
   * @param value
   */
  const handleChange: AutoCompleteProps['onChange'] = (value: string, options) => {
    const newValue = valueTransform(value, nameCase);

    onChange?.(newValue, options);
  };

  const handleDbclick = () => {
    if (dbclickToEnable && disabled) {
      setDisabled(false);
      requestAnimationFrame(() => {
        instanceRef.current?.focus();
      });
    }
  };

  const handleBlur = (evt: React.FocusEvent<HTMLElement>) => {
    onBlur?.(evt);

    if (dbclickToEnable && !disabled) {
      setDisabled(true);
    }
  };

  const handleSearch = (value: string) => {
    const result = search(value);
    setOptions(result.map(i => ({ label: i, value: i })));
  };

  return (
    <AutoComplete
      className={classNames('vd-name-input', 'u-fw')}
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      options={options}
      maxLength={256}
      backfill
      ref={instanceRef as any}
      // 支持继承
      disabled={disabled ? true : undefined}
      placeholder={NameTooltipSimple[nameCase]}
      // @ts-expect-error
      onDoubleClick={handleDbclick}
      title={dbclickToEnable && disabled ? '谨慎修改，双击进行变更' : ''}
      onBlur={handleBlur}
      {...other}
    />
  );
});

NameInput.displayName = 'NameInput';
