import classNames from 'classnames';
import { observer } from 'mobx-react';
import { ReactNode, cloneElement, isValidElement, useMemo } from 'react';

import { useEditorFormContext } from './FormContext';
import s from './FormItem.module.scss';
import { EditorFormTooltip } from './FormTooltip';

export type EditorFormItemTrigger = string | string[];

export interface EditorFormItemProps {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;

  /**
   * 字段路径
   */
  path: string;

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

  /**
   * 设置收集字段值变更的时机, 默认 onChange
   */
  validateTrigger?: EditorFormItemTrigger;

  /**
   * 设置收集字段值变更的时机 , 默认为 onChange
   */
  trigger?: string;

  /**
   * 设置 value 传入，或者从 event 对象 target 中收集值的属性名称， 默认为 value
   */
  valuePropName?: string;
}

export function defaultGetValueFromEvent(valuePropName: string, ...args: any[]) {
  const event = args[0];

  if (event && event.target && typeof event.target === 'object' && valuePropName in event.target) {
    return (event.target as any)[valuePropName];
  }

  return event;
}

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
  } = props;
  const { formModel } = useEditorFormContext()!;

  const isRequired = useMemo(() => {
    return !!(required || formModel.isRequired(path));
  }, [required, formModel, path]);

  const injectChildren = (child: ReactNode) => {
    if (isValidElement(child)) {
      const injected: any = {
        [valuePropName]: formModel.getProperty(path),
        [trigger]: (evt: any) => {
          const value = defaultGetValueFromEvent(valuePropName, evt);

          formModel.setProperty(path, value);
        },
      };

      const validateTriggers = Array.isArray(validateTrigger) ? validateTrigger : [validateTrigger];

      for (const t of validateTriggers) {
        const originTrigger = injected[t];

        injected[t] = (...args: any) => {
          originTrigger?.(...args);

          // do validate
          formModel.validateField(path);
        };
      }

      return cloneElement(child, injected as any);
    }

    return child;
  };

  return (
    <div className={classNames('vd-form-item', className, s.root)} style={style}>
      <label className={classNames('vd-form-item__label', s.label)}>
        {isRequired && <span className={classNames('vd-form-item__require', s.required)}>*</span>}
        {label}
        <EditorFormTooltip tooltip={tooltip} path={path} formModel={formModel} />
      </label>
      <div className={classNames('vd-form-item__body', s.body)}>{injectChildren(children)}</div>
    </div>
  );
});
