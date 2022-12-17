import { Cell } from '@antv/x6';
import isEqual from 'lodash/isEqual';
import React from 'react';

import { wrapPreventListenerOptions } from '../hooks';

export class CellUpdater<T extends Cell = Cell> {
  constructor(protected instance: React.MutableRefObject<T | undefined>) {}

  private cellKeys = ['attrs', 'zIndex', 'visible', 'data', 'tools'];
  private previous: Record<string, any> = {};

  get attrs() {
    return this.instance.current!.getAttrs();
  }

  set attrs(value: any) {
    // 注意 attrs 里面可能有一些 x6 计算出来的属性，不能直接替换
    this.instance.current!.setAttrs(value, wrapPreventListenerOptions({}));
  }

  get zIndex(): number | undefined {
    return this.instance.current!.getZIndex();
  }

  set zIndex(value: number | undefined) {
    if (value !== undefined) {
      this.instance.current!.setZIndex(value, wrapPreventListenerOptions({}));
    }
  }

  get visible() {
    return this.instance.current!.visible;
  }

  set visible(visible: boolean) {
    this.instance.current!.setVisible(visible, wrapPreventListenerOptions({}));
  }

  get data() {
    return this.instance.current!.getData();
  }

  set data(value: any) {
    this.instance.current!.setData(value, wrapPreventListenerOptions({ overwrite: true }));
  }

  get tools() {
    return this.instance.current!.getTools();
  }

  set tools(value: any) {
    this.instance.current?.setTools(value, wrapPreventListenerOptions({}));
  }

  accept(props: Record<string, any>) {
    for (const key of this.cellKeys) {
      this.doUpdate(key, props[key]);
    }
  }

  protected doUpdate(key: string, value: any, deep: boolean = false): void {
    // 未就绪
    if (this.instance.current == null) {
      return;
    }

    const previous = this.previous[key];
    this.previous[key] = value;

    // 值未变动
    if (previous === value) {
      return;
    }

    // 值未定义
    if (value === undefined) {
      return;
    }

    const store = this as any;
    const currentValue = store[key];

    if (deep) {
      if (isEqual(previous, value)) {
        return;
      }

      if (isEqual(currentValue, value)) {
        return;
      }
    } else if (currentValue === value) {
      return;
    }

    store[key] = value;
  }
}
