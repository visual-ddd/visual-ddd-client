import { AutoCompleteProps, AutoComplete } from 'antd';
import classNames from 'classnames';
import React, { memo, useRef, useState } from 'react';
import { NameTooltipSimple } from '../../constants';

import { NameCase } from '../../dsl';
import { allow } from './utils';

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

// TODO: 统一语言推断和转换
// const words: string[] = ['you', 'are', 'hello', 'word'];

/**
 * 标识符输入框
 */
export const NameInput = memo((props: NameInputProps) => {
  const { className, value, dbclickToEnable, nameCase = 'camelCase', onBlur, ...other } = props;
  const [disabled, setDisabled] = useState(!!dbclickToEnable);
  const instanceRef = useRef<{ focus: () => void }>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();

    if (e.key.length !== 1) {
      return;
    }

    if (!allow(e.key, value, nameCase)) {
      e.preventDefault();
    }
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

  return (
    <AutoComplete
      className={classNames('vd-name-input', 'u-fw')}
      value={value}
      onKeyDown={handleKeyDown}
      maxLength={256}
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
