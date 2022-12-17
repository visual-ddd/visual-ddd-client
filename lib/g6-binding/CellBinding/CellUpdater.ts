import { Cell } from '@antv/x6';
import isEqual from 'lodash/isEqual';
import React from 'react';

import { wrapPreventListenerOptions } from '../hooks';

/**
 * 属性更新器
 * 每个字段都要考虑传入 undefined 的创建
 */
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
    // 这里 默认值为 1, 并不可靠，x6 默认行为是按照添加顺序递增
    this.instance.current!.setZIndex(value ?? 1, wrapPreventListenerOptions({}));
  }

  get visible() {
    return this.instance.current!.visible;
  }

  set visible(visible: boolean) {
    this.instance.current!.setVisible(visible ?? true, wrapPreventListenerOptions({}));
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
    if (value === undefined) {
      this.instance.current!.removeTools(wrapPreventListenerOptions({}));
    } else {
      this.instance.current?.setTools(value, wrapPreventListenerOptions({}));
    }
  }

  accept(props: Record<string, any>) {
    for (const key of this.cellKeys) {
      this.doUpdate(key, props[key], { object: props });
    }
  }

  protected doUpdate(key: string, value: any, options: { deep?: boolean; object: Record<string, any> }): void {
    const { deep = false, object } = options;
    // 未就绪
    if (this.instance.current == null) {
      return;
    }

    // 未定义
    if (!(key in object)) {
      return;
    }

    const previous = this.previous[key];
    this.previous[key] = value;

    // 值未变动
    if (previous === value) {
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
