import { Alert, Empty, Input, Select } from 'antd';
import { observer } from 'mobx-react';
import useSwr from 'swr';
import { useMemo } from 'react';

import { BotPromptLibraryProvider } from '../BotPromptLibraryContext';
import { BotPromptLibraryModel } from '../BotPromptLibraryModel';
import { Prompt } from '../types';
import { Card } from './Card';
import s from './List.module.scss';

export interface ListProps {
  /**
   * 导入
   * @param item
   * @returns
   */
  onImport?: (item: Prompt) => void;
}

/**
 * prompt 列表
 * @param props
 */
export const List = observer(function List(props: ListProps) {
  const { onImport } = props;
  const model = useMemo(() => {
    return new BotPromptLibraryModel();
  }, []);

  const { isLoading, error } = useSwr(
    'getPromptList',
    () => {
      return model.initial();
    },
    { revalidateOnFocus: false }
  );

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    model.setQuery(evt.target.value);
  };

  return (
    <BotPromptLibraryProvider model={model}>
      <div id="prompt-library">
        <div className={s.root}>
          <header className={s.head}>
            <div className={s.title}>探索</div>
            <Select
              className={s.category}
              placeholder="分类"
              size="large"
              allowClear
              onChange={model.setCategory}
              showSearch
              options={model.categories.map(i => {
                return {
                  label: i,
                  value: i,
                };
              })}
            ></Select>
            <Input
              className={s.search}
              placeholder="搜索"
              size="large"
              value={model.query}
              onChange={handleChange}
              allowClear
            />
          </header>
          <main className={s.body}>
            {!model.filteredByQuery.length && !isLoading && <Empty></Empty>}
            {!!error && <Alert banner type="error" showIcon message={error.message}></Alert>}
            {!!model.filteredByQuery.length && (
              <div className={s.list}>
                {model.filteredByQuery.map(i => {
                  return <Card key={i.uuid} item={i} onImport={onImport} />;
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </BotPromptLibraryProvider>
  );
});
