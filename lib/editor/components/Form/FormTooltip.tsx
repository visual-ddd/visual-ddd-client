import { ExclamationCircleFilled, QuestionCircleFilled } from '@ant-design/icons';
import { Popover, Tooltip } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { ReactNode } from 'react';

import { FormModel } from '../../Model';
import { EditorFormIssues } from './FormIssues';

import s from './FormTooltip.module.scss';

export interface EditorFormTooltipProps {
  /**
   * 正常的提示
   */
  tooltip?: ReactNode;

  /**
   * 指定路径, 可选，如果为空则限制整个 model 的错误
   */
  path: string;

  /**
   * 表单模型
   */
  formModel: FormModel;

  /**
   * 是否获聚合下级属性的错误信息, 默认 false
   */
  aggregated?: boolean;

  className?: string;
  style?: React.CSSProperties;
}

export const EditorFormTooltip = observer(function EditFormTooltip(props: EditorFormTooltipProps) {
  const { tooltip, path, formModel, aggregated = false, className, style } = props;
  const status = aggregated ? formModel.getAggregatedValidateStatus(path) : formModel.getValidateStatus(path);
  const hasIssue = Array.isArray(status) ? status.length : status;
  const hasError =
    hasIssue && (Array.isArray(status) ? status.length && status.some(s => s.errors.length) : status?.errors.length);
  const hasWarning = hasIssue && !hasError;

  return (
    <span
      className={classNames(
        'vd-form-tooltip',
        className,
        {
          error: hasError,
          warning: hasWarning,
        },
        s.root
      )}
      style={style}
    >
      {hasIssue ? (
        <Popover content={<EditorFormIssues issues={status!} />} title="告警" trigger="click">
          <ExclamationCircleFilled />
        </Popover>
      ) : tooltip ? (
        <Tooltip title={tooltip}>
          <QuestionCircleFilled />
        </Tooltip>
      ) : null}
    </span>
  );
});
