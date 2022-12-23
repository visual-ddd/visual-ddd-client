/**
 * 颜色选择器
 */
import React, { FC, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Input, InputProps, Popover, message } from 'antd';
import { ColorPalette, isValidCSSColor } from './ColorPalette';
import { globalHistory } from './ColorHistory';

import s from './index.module.scss';

export interface ColorInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  className?: string;
  style?: React.CSSProperties;
  value?: string;
  onChange?: (value?: string) => void;
}

export const ColorInput: FC<ColorInputProps> = observer(function CSSColorInput(props) {
  const { className, onChange, value, ...other } = props;
  const [visible, setVisible] = useState(false);
  const [valueCache, setValueCache] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValueCache(e.target.value);
  };

  // 检查颜色是否正确
  const handleBlur = () => {
    if (value === valueCache) {
      return;
    }

    if (!valueCache) {
      onChange?.(undefined);
      return;
    }

    if (!isValidCSSColor(valueCache)) {
      message.warning('请输入合法颜色值');
      return;
    }

    onChange?.(valueCache);
    globalHistory.push(valueCache);
  };

  const handleVisibleChange = (e: boolean) => {
    setVisible(e);
    if (!e && value) {
      globalHistory.push(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      handleBlur();
    }
  };

  // 同步
  useEffect(() => {
    if (value !== valueCache) {
      setValueCache(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      prefix={
        <Popover
          trigger="click"
          open={visible}
          onOpenChange={handleVisibleChange}
          content={<ColorPalette value={value} onChange={onChange} />}
          overlayClassName={classNames('vd-color-picker__popover', s.popover)}
          placement="left"
        >
          <div className={classNames('vd-color-picker__preview', s.preview)} style={{ background: value }}></div>
        </Popover>
      }
      className={classNames('vd-color-picker', s.root, className)}
      value={valueCache}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      {...other}
    ></Input>
  );
});

ColorInput.displayName = 'ColorPicker';
