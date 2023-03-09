import { NoopArray } from '@wakeapp/utils';
import { AutoCompleteProps, AutoComplete, Alert } from 'antd';
import classNames from 'classnames';
import React, { memo, useRef, useState } from 'react';
import { NameTooltipSimple, NameCase } from '@/lib/core';
import { useIdentifierCompletion } from '@/lib/components/Completion';

import { UbiquitousLanguageCompletionItem, useUbiquitousLanguageCompletion } from '../UbiquitousLanguageCompletion';

import { valueTransform } from './utils';
import s from './index.module.scss';

export * from './useAutoCompleteUbiquitousLanguage';

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

  onMatchUbiquitousLanguage?: (value: UbiquitousLanguageCompletionItem) => void;
}

/**
 * 标识符输入框
 */
export const NameInput = memo((props: NameInputProps) => {
  const {
    className,
    value,
    onChange,
    onMatchUbiquitousLanguage,
    dbclickToEnable,
    nameCase = 'camelCase',
    onBlur,
    ...other
  } = props;
  const [disabled, setDisabled] = useState(!!dbclickToEnable);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(NoopArray);
  const instanceRef = useRef<{ focus: () => void }>(null);
  const search = useIdentifierCompletion(nameCase);
  const ubiquitousLanguageCompletion = useUbiquitousLanguageCompletion();
  const [matchedVisible, setMatchVisible] = useState(false);
  const [matchedList, setMatchedList] = useState<UbiquitousLanguageCompletionItem[]>(NoopArray);

  const matchUbiquitousLanguage = (value: string) => {
    if (!ubiquitousLanguageCompletion || !onMatchUbiquitousLanguage) {
      // 筛选有没有匹配的统一语言
      return;
    }

    const list = ubiquitousLanguageCompletion.search(value).filter(i => i.id && i.title);

    if (list.length) {
      setMatchedList(list);
      setMatchVisible(true);
    } else {
      setMatchedList(NoopArray);
    }
  };

  /**
   * 值变动
   * @param value
   */
  const handleChange: AutoCompleteProps['onChange'] = (value: string, options) => {
    const newValue = valueTransform(value, nameCase);

    onChange?.(newValue, options);
  };

  const handleMatch = (item: UbiquitousLanguageCompletionItem) => {
    onMatchUbiquitousLanguage?.(item);
    setMatchVisible(false);
  };

  const handleSelect: AutoCompleteProps['onSelect'] = (value: string) => {
    if (value.trim()) {
      matchUbiquitousLanguage(value);
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

  const handleSearch = (value: string) => {
    const result = search(value);
    setOptions(result.map(i => ({ label: i, value: i })));
  };

  return (
    <div className={s.root}>
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
        onSelect={handleSelect}
        virtual={false}
        {...other}
      />
      {!!matchedList.length && matchedVisible && (
        <Alert
          type="info"
          showIcon
          className={s.match}
          closable
          message={
            <div className={s.matchBody}>
              <span className={s.matchHeader}>匹配到统一语言，是否自动填充标题和描述?</span>
              <div className={s.matchContent}>
                <ul className={s.matchList}>
                  {matchedList.map(i => {
                    return (
                      <li key={i.id} className="u-link" onClick={() => handleMatch(i)}>
                        {i.id} : {i.title}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          }
        ></Alert>
      )}
    </div>
  );
});

NameInput.displayName = 'NameInput';
