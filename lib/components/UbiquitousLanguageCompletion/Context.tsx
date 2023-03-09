import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { NoopArray } from '@wakeapp/utils';
import { reaction } from 'mobx';
import uniqBy from 'lodash/uniqBy';

export interface UbiquitousLanguageCompletionItem {
  id?: string;
  title?: string;
  description?: string;
}

export interface UbiquitousLanguageCompletionContextValue {
  /**
   * 根据标识符搜索推断
   * @param id
   */
  search(id: string): UbiquitousLanguageCompletionItem[];
}

export interface UbiquitousLanguageCompletionProviderProps {
  /**
   * 用于监听变化,
   * - 必须 observable
   * - 尽量是不可变的，如果变化会重新触发监听
   */
  list: () => UbiquitousLanguageCompletionItem[];
  children: React.ReactNode;
}

const CONTEXT = createContext<UbiquitousLanguageCompletionContextValue | null>(null);
CONTEXT.displayName = 'UbiquitousLanguageCompletionContext';

export function useUbiquitousLanguageCompletion() {
  return useContext(CONTEXT);
}

const createFuse = () => new Fuse<UbiquitousLanguageCompletionItem>([], { keys: ['id'], threshold: 0.3 });

export const UbiquitousLanguageCompletionProvider = (props: UbiquitousLanguageCompletionProviderProps) => {
  const { list } = props;
  const [fuse] = useState(createFuse);

  const value: UbiquitousLanguageCompletionContextValue = useMemo(() => {
    return {
      search(id) {
        return uniqBy(
          fuse.search(id).map(i => i.item),
          ({ id, title }) => {
            return `${id}__${title}`;
          }
        );
      },
    };
  }, [fuse]);

  /**
   * 监听列表的变动
   */
  useEffect(() => {
    return reaction(
      list,
      results => {
        fuse.setCollection((results ?? NoopArray).filter(i => i.id));
      },
      {
        name: 'WATCH_UBIQUITOUS_LANGUAGE_COMPLETION',
        fireImmediately: true,
        delay: 2000,
        requiresObservable: true,
      }
    );
  }, [list, fuse]);

  return <CONTEXT.Provider value={value}>{props.children}</CONTEXT.Provider>;
};
