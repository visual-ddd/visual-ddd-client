/**
 * 色盘
 */
import React, { FC, useRef, useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { SketchPicker, Color, ColorResult } from 'react-color';
import colorString from 'color-string';
import classNames from 'classnames';
import { useRefValue } from '@wakeapp/hooks';
import { rafDebounce } from '@wakeapp/utils';

import { globalHistory } from './ColorHistory';
import s from './ColorPalette.module.scss';

export interface ColorPaletteProps {
  className?: string;
  style?: React.CSSProperties;
  /**
   * CSS 颜色值
   */
  value?: string;

  onChange?: (value?: string) => void;
}

export function isValidCSSColor(value: string | string | null) {
  if (value == null) {
    return false;
  }

  return colorString.get(value) != null;
}

export function colorToString(color: Color) {
  if (typeof color === 'string') {
    return color;
  } else if ('r' in color) {
    return `rgb(${color.r},${color.g},${color.b}${color.a != null ? `,${color.a}` : ''})`;
  } else {
    return `hsl(${color.h},${color.s},${color.l}${color.a != null ? `,${color.a}` : ''})`;
  }
}

export const ColorPalette: FC<ColorPaletteProps> = observer(function ColorPalette(props) {
  const { className, value, onChange, ...other } = props;
  const onChangeRef = useRefValue(onChange);
  const cssValueRef = useRef(value);
  const [colorCache, setColorCache] = useState<Color | undefined>(undefined);

  // 实时更新
  const submit = useMemo(
    () =>
      rafDebounce((v: Color | undefined) => {
        const cssValue = v && colorToString(v);
        cssValueRef.current = cssValue;
        onChangeRef.current?.(cssValue);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChange = (e: ColorResult) => {
    // @ts-expect-error
    const source = e.source as string;
    let v: Color | undefined;
    if (source === 'rgb') {
      v = e.rgb;
    } else {
      v = e.hex;
    }

    setColorCache(v);
    submit(v);
  };

  const handlePickHistory = (val: string) => {
    setColorCache(val);
    submit(val);
  };

  useEffect(() => {
    // 外部变化
    if (value !== cssValueRef.current) {
      setColorCache(value);
      cssValueRef.current = value;
    }
  }, [value]);

  return (
    <div className={classNames('vd-color-palette', className, s.root)} {...other}>
      <SketchPicker color={colorCache} onChange={handleChange} />
      {!!globalHistory.list.length && (
        <div className={classNames('vd-color-palette__history', s.history)}>
          <div className={classNames('vd-color-list-name', s.colorListName)}>历史记录</div>
          <div className={classNames('vd-color-list', s.colorList)}>
            {globalHistory.list.map(i => {
              return (
                <div
                  className={classNames('vd-color-item', s.colorItem)}
                  key={i}
                  style={{ backgroundColor: i }}
                  onClick={() => handlePickHistory(i)}
                ></div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

ColorPalette.displayName = 'ColorPalette';
