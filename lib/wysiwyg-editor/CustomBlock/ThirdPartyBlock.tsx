import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';
import { Resizable } from 'react-resizable';
import clamp from 'lodash/clamp';

import s from './ThirdPartyBlock.module.scss';
import { ExpandIcon } from './ExpandIcon';
import { OpenIcon } from './OpenIcon';

export interface ThirdPartyBlockState {
  url?: string;
  height: number;
}

export interface ThirdPartyBlockProps {
  className?: string;

  title?: string;

  style?: React.CSSProperties;

  /**
   * 初始提示
   */
  placeholder: string;

  /**
   * 填入实例值
   */
  exampleValue: string;

  /**
   * 当前值
   */
  value?: string;

  /**
   * 值变动
   * @param value
   * @returns
   */
  onChange: (value: string) => void;

  height?: number;

  onHeightChange?: (height: number) => void;
}

const DEFAULT_HEIGHT = 500;

export const ThirdPartyBlock = (props: ThirdPartyBlockProps) => {
  const { value, placeholder, className, title, exampleValue, height, onHeightChange, onChange, ...other } = props;
  const [url, setUrl] = useState('');
  const [heightCache, setHeightCache] = useState<number>(DEFAULT_HEIGHT);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [resizing, setResizing] = useState(false);

  const handleInputExample = () => {
    onChange(exampleValue);
  };

  const handleConfirm = () => {
    try {
      if (url) {
        onChange(url);
      }
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleHeightChange = (h: number) => {
    setHeightCache(clamp(h, DEFAULT_HEIGHT, 1000));
  };

  const handleFullScreen = (evt: React.MouseEvent) => {
    frameRef.current?.requestFullscreen();
  };

  const handleOpen = (evt: React.MouseEvent) => {
    window.open(value);
  };

  useEffect(() => {
    if (height) {
      setHeightCache(height);
    }

    if (value) {
      setUrl(value);
    }
  }, [height, value]);

  return (
    <div className={classNames(s.root, className)} {...other}>
      {!value && (
        <div className={s.placeholder}>
          <input
            className={s.urlInput}
            value={value || url}
            onChange={e => setUrl(e.target.value)}
            placeholder={placeholder}
          ></input>
          <span className={s.inputExample} onClick={handleInputExample}>
            填入示例
          </span>
          <Button type="primary" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      )}
      {!!value && (
        <Resizable
          height={heightCache}
          axis="y"
          onResize={(e, { size }) => {
            handleHeightChange(size.height);
          }}
          onResizeStart={() => {
            setResizing(true);
          }}
          onResizeStop={(e, { size }) => {
            onHeightChange?.(size.height);
            setResizing(false);
          }}
        >
          <div className={s.container} style={{ height: `${heightCache}px` }}>
            <iframe
              ref={frameRef}
              src={value}
              className={s.frame}
              title={title}
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            ></iframe>
            <div className={classNames(s.mask, { [s.resizing]: resizing })}></div>
            <div className={s.actions}>
              <ExpandIcon onClick={handleFullScreen}></ExpandIcon>
              <OpenIcon onClick={handleOpen} />
            </div>
          </div>
        </Resizable>
      )}
    </div>
  );
};
