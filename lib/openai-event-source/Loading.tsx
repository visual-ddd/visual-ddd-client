import { Popover } from 'antd';
import { observer } from 'mobx-react';

import { OpenAIEventSourceModel } from './OpenAIEventSourceModel';

import s from './Loading.module.scss';
import { LoadingIcon } from './LoadingIcon';

export interface LoadingProps {
  model: OpenAIEventSourceModel;
}

export const Loading = observer(function Loading(props: LoadingProps) {
  const { model } = props;
  const loading = model.loading;
  const result = model.result;

  if (!loading) {
    return null;
  }

  return (
    <Popover title="对话中" content={<div className={s.root}>{result}</div>} placement="bottomRight" trigger="click">
      <div className={s.icon}>
        <LoadingIcon className={s.svg} />
      </div>
    </Popover>
  );
});
