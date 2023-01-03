import { Checkbox, Input } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import classNames from 'classnames';
import { memo } from 'react';
import prod from 'immer';

import { SourceDSL } from '../../dsl';
import { createSourceDSL } from '../../factory';

import s from './index.module.scss';
import { toJS } from 'mobx';

export interface SourceInputProps {
  value?: SourceDSL;
  onChange?: (value?: SourceDSL) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SourceInput = memo((props: SourceInputProps) => {
  const { value, onChange } = props;

  const getValue = () => {
    if (value == null) {
      return createSourceDSL();
    }

    return toJS(value);
  };

  const handleCheckboxChange = (key: keyof SourceDSL) => (e: CheckboxChangeEvent) => {
    const value = getValue();
    const newValue = prod(value, d => {
      d[key].enabled = e.target.checked;
    });
    onChange?.(newValue);
  };

  const handleInputChange =
    (key: Extract<keyof SourceDSL, 'event' | 'schedule'>) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = getValue();
      const newValue = prod(value, d => {
        d[key].value = e.target.value;
      });
      onChange?.(newValue);
    };

  return (
    <div className={classNames('vd-source-input', s.root)}>
      <Checkbox checked={value?.http.enabled} onChange={handleCheckboxChange('http')}>
        HTTP
      </Checkbox>
      <Checkbox checked={value?.rpc.enabled} onChange={handleCheckboxChange('rpc')}>
        RPC
      </Checkbox>
      <Checkbox checked={value?.event.enabled} onChange={handleCheckboxChange('event')}>
        <div className={s.row}>
          <span>事件</span>{' '}
          <Input
            placeholder="事件名称"
            disabled={!value?.event.enabled}
            value={value?.event.value ?? ''}
            onChange={handleInputChange('event')}
          />
        </div>
      </Checkbox>
      <Checkbox checked={value?.schedule.enabled} onChange={handleCheckboxChange('schedule')}>
        <div className={s.row}>
          <span>定时任务</span>{' '}
          <Input
            placeholder="cron 表达式"
            disabled={!value?.schedule.enabled}
            value={value?.schedule.value ?? ''}
            onChange={handleInputChange('schedule')}
          />
        </div>
      </Checkbox>
    </div>
  );
});

SourceInput.displayName = 'SourceInput';
