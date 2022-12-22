import classNames from 'classnames';
import { createElement } from 'react';
import { observer } from 'mobx-react';
import { SortableContainer, SortableElement, SortEndHandler, SortableHandle } from 'react-sortable-hoc';
import { get, NoopObject } from '@wakeapp/utils';
import { HolderOutlined } from '@ant-design/icons';

import s from './index.module.scss';

export interface SortableListProps<T = any, C extends {} = {}> {
  /**
   * 列表
   */
  value: T[];

  /**
   * 列表变更
   * @param value
   * @returns
   */
  onChange?: (value: T[]) => void;

  className?: string;
  style?: React.CSSProperties;

  /**
   * 唯一标识符
   */
  id: string;

  /**
   * 上下文
   */
  context: C;

  /**
   * 列表项组件
   */
  Item: React.ComponentType<{ value: T; context: C; index: number }>;
}

type ItemProps<T = any, C extends {} = {}> = {
  item: T;
  context: C;
  idx: number;
  Implement: React.ComponentType<{ value: T; context: C; index: number }>;
};
const Item = SortableElement<ItemProps>(function SortableItem({ item, Implement, context, idx }: ItemProps) {
  return createElement(Implement, { value: item, context, index: idx });
});

const Container = SortableContainer<SortableListProps>(function SortableContainer(props: SortableListProps) {
  const { id, className, style, context, value, Item: Implement } = props;

  return (
    <div className={classNames('vd-sortable-list', className)} style={style}>
      {value.map((i, idx) => {
        return (
          <Item
            key={get(i, id)}
            context={context ?? NoopObject}
            index={idx}
            idx={idx}
            item={i}
            Implement={Implement}
          ></Item>
        );
      })}
    </div>
  );
});

export interface DragHandleProps {
  className?: string;
  style?: React.CSSProperties;
}
export const DragHandle = SortableHandle<DragHandleProps>(function DragHandle(props: DragHandleProps) {
  return (
    <div {...props} className={classNames('vd-sortable-list__handle', s.handle, props.className)}>
      <HolderOutlined />
    </div>
  );
});

/**
 * 可排序列表
 */
export const SortableList = observer(function SortableList<T = any, C extends {} = {}>(props: SortableListProps<T, C>) {
  const { value, onChange } = props;

  const handleSortEnd: SortEndHandler = sort => {
    const clone = value.slice(0);
    const { oldIndex, newIndex } = sort;
    const [item] = clone.splice(oldIndex, 1);
    if (item) {
      clone.splice(newIndex, 0, item);
    }

    onChange?.(clone);
  };

  return (
    // @ts-expect-error
    <Container
      {...props}
      onSortEnd={handleSortEnd}
      useDragHandle
      helperClass={classNames(s.dragging, 'dragging')}
    ></Container>
  );
});
