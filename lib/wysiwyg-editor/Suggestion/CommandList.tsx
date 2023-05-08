import { SuggestionKeyDownProps, SuggestionProps } from './suggestion';
import React, { Component, createRef } from 'react';
import { createPortal } from 'react-dom';
import groupBy from 'lodash/groupBy';

import { Item } from './types';
import s from './CommandList.module.scss';
import classNames from 'classnames';
import { Default } from './icons';
import { Disposer, rafDebounce } from '@wakeapp/utils';

export interface CommandListProps extends SuggestionProps<Item> {}

interface CommandListState {
  selectedIndex: number;
}

const computePosition = (rect: DOMRect | undefined | null, boxRect: DOMRect | undefined) => {
  if (!rect || !boxRect) {
    return undefined;
  }

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const boxWidth = boxRect.width;
  const boxHeight = boxRect.height;
  let x = rect.left;
  let y = rect.top + rect.height;

  if (x + boxWidth > windowWidth) {
    x = x - boxWidth;
  }

  if (y + boxHeight > windowHeight) {
    y = y - boxHeight - rect.height;
  }

  return { x, y };
};

export class CommandList extends Component<CommandListProps, CommandListState> {
  override state: CommandListState = {
    selectedIndex: 0,
  };

  private elRef = createRef<HTMLDivElement>();
  private disposer = new Disposer();

  override componentDidMount(): void {
    this.updatePosition();

    this.disposer.push(this.watchEditor());
  }

  override componentWillUnmount(): void {
    this.disposer.release();
  }

  override componentDidUpdate(oldProps: CommandListProps) {
    if (this.props.items !== oldProps.items) {
      this.setState({
        selectedIndex: 0,
      });
    }

    this.updatePosition();
  }

  onKeyDown({ event }: SuggestionKeyDownProps) {
    if (event.key === 'ArrowUp') {
      this.upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      this.downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      this.enterHandler();
      return true;
    }

    return false;
  }

  upHandler() {
    this.setState(
      {
        selectedIndex: (this.state.selectedIndex + this.props.items.length - 1) % this.props.items.length,
      },
      this.scrollToShowSelected
    );
  }

  downHandler() {
    this.setState(
      {
        selectedIndex: (this.state.selectedIndex + 1) % this.props.items.length,
      },
      this.scrollToShowSelected
    );
  }

  enterHandler() {
    this.selectItem(this.state.selectedIndex);
  }

  selectItem(index: number) {
    const item = this.props.items[index];

    if (item) {
      this.props.command(item);
    }
  }

  private watchEditor = () => {
    let asyncTask: number | undefined;

    const handleBlur = () => {
      asyncTask = requestAnimationFrame(() => {
        if (this.elRef.current) {
          this.elRef.current.style.display = 'none';
        }
      });
    };

    const handleFocus = () => {
      if (this.elRef.current) {
        this.elRef.current.style.display = 'block';
      }
    };

    this.props.editor.on('blur', handleBlur).on('focus', handleFocus);
    const container = this.props.editor.view.dom.parentElement;
    const debounceUpdatePosition = rafDebounce(this.updatePosition);

    if (container) {
      container.addEventListener('scroll', debounceUpdatePosition);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', debounceUpdatePosition);
      }
      if (asyncTask) {
        cancelAnimationFrame(asyncTask);
      }
      this.props.editor.off('blur', handleBlur).off('focus', handleFocus);
    };
  };

  private updatePosition = () => {
    const rect = this.props.clientRect?.();
    const element = this.elRef.current;
    const elementRect = element?.getBoundingClientRect();

    const position = computePosition(rect, elementRect);

    if (position && element) {
      element.style.left = `${position.x}px`;
      element.style.top = `${position.y}px`;
    }
  };

  private scrollToShowSelected = () => {
    requestAnimationFrame(() => {
      const el = this.elRef.current?.querySelector('.' + s.selected);
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  };

  override render() {
    const { items } = this.props;

    const groups = groupBy(items, 'category');

    return createPortal(
      <div className={s.root} ref={this.elRef}>
        {!items.length && <div className={s.empty}>没有匹配的结果</div>}
        {Object.keys(groups).map(category => {
          return (
            <div className={s.group} key={category}>
              <div className={s.groupName}>{category}</div>
              <div className={s.items}>
                {groups[category].map(item => {
                  const index = items.indexOf(item);

                  return (
                    <div
                      className={classNames(s.item, { [s.selected]: index === this.state.selectedIndex })}
                      key={index}
                      onClick={() => this.selectItem(index)}
                    >
                      <div className={s.icon}>{React.createElement(item.icon || Default)}</div>
                      <div className={s.name}>{item.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>,
      document.body
    );
  }
}
