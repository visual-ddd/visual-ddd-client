import { BulbFilled, ExclamationCircleFilled, QuestionCircleFilled } from '@ant-design/icons';
import { Popover, Tooltip } from 'antd';
import classNames from 'classnames';
import { action, computed, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ReactNode, useEffect, useMemo } from 'react';
import { IValidateStatus } from '@/lib/core';

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

class LocalStore implements IValidateStatus {
  @observable
  aggregated?: boolean;

  @observable
  path?: string;

  @observable
  formModel?: FormModel;

  @action
  setPath(path?: string) {
    this.path = path;
  }

  @action
  setFormModel(model?: FormModel) {
    this.formModel = model;
  }

  @action
  setAggregated(aggregated?: boolean) {
    this.aggregated = aggregated;
  }

  constructor() {
    makeObservable(this);
  }

  @computed
  get status() {
    return this.path && this.formModel
      ? this.aggregated
        ? this.formModel.getAggregatedValidateStatus(this.path)
        : this.formModel.getValidateStatus(this.path)
      : undefined;
  }

  @computed
  get hasIssue() {
    return !!(Array.isArray(this.status) ? this.status.length : this.status);
  }

  @computed
  get hasError() {
    return !!(
      this.hasIssue &&
      (Array.isArray(this.status)
        ? this.status.length && this.status.some(s => s.errors.length)
        : this.status?.errors.length)
    );
  }

  @computed
  get hasWarning() {
    return !!(
      this.hasIssue &&
      !this.hasError &&
      (Array.isArray(this.status)
        ? this.status.length && this.status.some(s => s.warnings.length)
        : this.status?.warnings.length)
    );
  }

  @computed
  get hasException() {
    return this.hasIssue && (this.hasError || this.hasWarning);
  }

  @computed
  get hasTip() {
    return this.hasIssue && !this.hasException;
  }
}

export const EditorFormTooltip = observer(function EditFormTooltip(props: EditorFormTooltipProps) {
  const { tooltip, path, aggregated = false, className, style } = props;
  const { formModel } = useEditorFormContext()!;
  const store = useMemo(() => {
    return new LocalStore();
  }, []);

  const hasTooltipOrIssue = tooltip || store.hasIssue;

  useEffect(() => {
    store.setFormModel(formModel);
    store.setPath(path);
    store.setAggregated(aggregated);
  }, [store, path, formModel, aggregated]);

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
          tip: store.hasTip,
        },
        s.root
      )}
      style={style}
    >
      {store.hasIssue ? (
        <Popover
          placement="bottomRight"
          destroyTooltipOnHide
          content={
            <div className={classNames('vd-form-tooltip__content', s.content)}>
              {!!tooltip && <div className={classNames('vd-form-tooltip__tooltip', s.tooltip)}>{tooltip}</div>}
              <EditorFormIssues formModel={formModel} issues={store.status!} />
            </div>
          }
          title="事件"
        >
          {store.hasException ? <ExclamationCircleFilled /> : <BulbFilled />}
        </Popover>
      ) : tooltip ? (
        <Tooltip title={tooltip}>
          <QuestionCircleFilled />
        </Tooltip>
      ) : null}
    </span>
  );
});
