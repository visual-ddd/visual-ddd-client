import classNames from 'classnames';
import { observer } from 'mobx-react';
import { reaction, runInAction } from 'mobx';
import { ReactNode, cloneElement, isValidElement, useMemo, useEffect, useCallback } from 'react';

import { useEditorFormContext } from './FormContext';
import s from './FormItem.module.scss';
import { EditorFormTooltip } from './FormTooltip';
import identity from 'lodash/identity';
import { NoopArray } from '@wakeapp/utils';

export type EditorFormItemTrigger = string | string[];

export interface EditorFormItemBaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  path?: string;

  /**
   * 是否获聚合下级属性的错误信息, 默认 false
   */
  aggregated?: boolean;

  /**
   * 标签
   */
  label: ReactNode;

  /**
   * 提示信息
   */
  tooltip?: ReactNode;

  /**
   * 必填样式
   */
  required?: boolean;
}

export interface EditorFormItemProps extends EditorFormItemBaseProps {
  /**
   * 字段路径
   */
  path: string;

  /**
   * 设置收集字段值变更的时机, 默认 onChange
   */
  validateTrigger?: EditorFormItemTrigger;

  /**
   * 字段依赖，当指定的字段值发生变化时，将重新验证
   */
  dependencies?: string | string[];

  /**
   * 当前字段进行验证时，需要通知验证的字段
   */
  notify?: string | string[];

  /**
   * 是否只在字段touch 之后才允许 dependencies 触发验证, 默认 true
   */
  dependenciesTriggerWhenTouched?: boolean;

  /**
   * 设置收集字段值变更的时机 , 默认为 onChange
   */
  trigger?: string;

  /**
   * 设置 value 传入，或者从 event 对象 target 中收集值的属性名称， 默认为 value
   */
  valuePropName?: string;

  /**
   * 支持在变更之间进行转换
   * @param value
   * @returns
   */
  onBeforeChange?: (value: any) => any;

  /**
   * 监听数据变更
   * @param value
   * @returns
   */
  onChange?: (value: any) => any;
}

export function defaultGetValueFromEvent(valuePropName: string, ...args: any[]) {
  const event = args[0];

  if (event && event.target && typeof event.target === 'object' && valuePropName in event.target) {
    return (event.target as any)[valuePropName];
  }

  return event;
}

export const EditorFormItemStatic = observer(function EditorFormItemStatic(props: EditorFormItemBaseProps) {
  const { className, style, required, label, tooltip, path, children, aggregated = false } = props;

  return (
    <div className={classNames('vd-form-item', className, s.root)} style={style}>
      <label className={classNames('vd-form-item__label', s.label)}>
        {required && <span className={classNames('vd-form-item__require', s.required)}>*</span>}
        {label}
        <EditorFormTooltip tooltip={tooltip} path={path} aggregated={aggregated} />
      </label>
      <div className={classNames('vd-form-item__body', s.body)}>{children}</div>
    </div>
  );
});

/**
 * 表单项
 */
export const EditorFormItem = observer(function EditorFormItem(props: EditorFormItemProps) {
  const {
    label,
    path,
    required,
    tooltip,
    className,
    style,
    children,
    trigger = 'onChange',
    validateTrigger = 'onChange',
    valuePropName = 'value',
    onBeforeChange = identity,
    onChange,
    aggregated = false,
    dependencies,
    notify,
    dependenciesTriggerWhenTouched = true,
  } = props;
  const { formModel } = useEditorFormContext()!;

  const isRequired = useMemo(() => {
    return !!(required || formModel.isRequired(path));
  }, [required, formModel, path]);

  const normalizedNotify = notify ? (Array.isArray(notify) ? notify : [notify]) : NoopArray;
  const normalizedDependencies = dependencies
    ? Array.isArray(dependencies)
      ? dependencies
      : [dependencies]
    : NoopArray;

  const validate = useCallback(() => {
    formModel.validateField(path);

    if (normalizedNotify.length) {
      for (const n of normalizedNotify) {
        formModel.validateField(n);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...normalizedNotify, path, formModel]);

  useEffect(() => {
    if (!dependencies) {
      return;
    }

    return reaction(
      () => {
        return normalizedDependencies.map(i => {
          formModel.getProperty(i);
        });
      },
      () => {
        if (dependenciesTriggerWhenTouched) {
          if (formModel.isTouched(path)) {
            validate();
          }
        } else {
          validate();
        }
      },
      { delay: 500, name: 'FormItemDependencies' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...normalizedDependencies, validate, formModel, path]);

  const injectChildren = (child: ReactNode) => {
    if (isValidElement(child)) {
      const injected: any = {
        [valuePropName]: formModel.getProperty(path),
        [trigger]: (evt: any) => {
          let value = defaultGetValueFromEvent(valuePropName, evt);
          runInAction(() => {
            value = onBeforeChange(value);

            formModel.setProperty(path, value);

            onChange?.(value);
          });
        },
      };

      const validateTriggers = Array.isArray(validateTrigger) ? validateTrigger : [validateTrigger];

      for (const t of validateTriggers) {
        const originTrigger = injected[t];

        injected[t] = (...args: any) => {
          originTrigger?.(...args);

          // do validate
          validate();
        };
      }

      return cloneElement(child, injected as any);
    }

    return child;
  };

  return (
    <EditorFormItemStatic
      className={className}
      style={style}
      path={path}
      label={label}
      required={isRequired}
      tooltip={tooltip}
      aggregated={aggregated}
    >
      {injectChildren(children)}
    </EditorFormItemStatic>
  );
});
