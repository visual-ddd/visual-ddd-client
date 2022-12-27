import { ExclamationCircleFilled, QuestionCircleFilled } from '@ant-design/icons';
import { Popover, Tooltip } from 'antd';
import classNames from 'classnames';
import { observer, useLocalObservable } from 'mobx-react';
import { ReactNode, useEffect } from 'react';

import { FormModel } from '../../Model';
import { useEditorFormContext } from './FormContext';
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
  path?: string;

  /**
   * 是否获聚合下级属性的错误信息, 默认 false
   */
  aggregated?: boolean;

  className?: string;
  style?: React.CSSProperties;
}

export const EditorFormTooltip = observer(function EditFormTooltip(props: EditorFormTooltipProps) {
  const { tooltip, path, aggregated = false, className, style } = props;
  const { formModel } = useEditorFormContext()!;
  const store = useLocalObservable(() => {
    return {
      path,
      formModel: formModel as FormModel | undefined,
      setPath(path?: string) {
        this.path = path;
      },
      setFormModel(model?: FormModel) {
        this.formModel = model;
      },
      get status() {
        return this.path && this.formModel
          ? aggregated
            ? this.formModel.getAggregatedValidateStatus(this.path)
            : this.formModel.getValidateStatus(this.path)
          : undefined;
      },
      get hasIssue() {
        return Array.isArray(this.status) ? this.status.length : this.status;
      },
      get hasError() {
        return (
          this.hasIssue &&
          (Array.isArray(this.status)
            ? this.status.length && this.status.some(s => s.errors.length)
            : this.status?.errors.length)
        );
      },
      get hasWarning() {
        return this.hasIssue && !this.hasError;
      },
    };
  });

  const hasTooltipOrIssue = tooltip || store.hasIssue;

  useEffect(() => {
    store.setFormModel(formModel);
    store.setPath(path);
  }, [store, path, formModel]);

  if (!hasTooltipOrIssue) {
    return null;
  }

  return (
    <span
      className={classNames(
        'vd-form-tooltip',
        className,
        {
          error: store.hasError,
          warning: store.hasWarning,
        },
        s.root
      )}
      style={style}
    >
      {store.hasIssue ? (
        <Popover
          placement="bottomRight"
          content={
            <div className={classNames('vd-form-tooltip__content', s.content)}>
              {!!tooltip && <div className={classNames('vd-form-tooltip__tooltip', s.tooltip)}>{tooltip}</div>}
              <EditorFormIssues issues={store.status!} />
            </div>
          }
          title="告警"
        >
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
