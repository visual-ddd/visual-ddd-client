import { Popover } from 'antd';
import { observer } from 'mobx-react';

import { OpenAIEventSourceModel } from './OpenAIEventSourceModel';

import s from './Loading.module.scss';

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
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={s.svg}>
          <circle cx="20" cy="50" r="10" fill="#717171">
            <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="10" fill="#717171">
            <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.1s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="50" r="10" fill="#717171">
            <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </Popover>
  );
});
