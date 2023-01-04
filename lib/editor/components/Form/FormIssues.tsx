import { CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { FormItemValidateStatus, ROOT_FIELD } from '../../Model';

import s from './FormIssues.module.scss';

export interface EditorFormIssuesProps {
  issues: FormItemValidateStatus | FormItemValidateStatus[];
  className?: string;
  style?: React.CSSProperties;
}

const PATH_NAME: Record<string, string> = {
  [ROOT_FIELD]: '图形',
};

/**
 * 告警信息渲染
 */
export const EditorFormIssues = observer(function EditorFormIssues(props: EditorFormIssuesProps) {
  const { issues, className, style } = props;

  const renderItem = (
    item: FormItemValidateStatus,
    itemProps?: { className?: string; style?: React.CSSProperties }
  ) => {
    return (
      <ul className={classNames('vd-editor-form-issues-list', s.list, itemProps?.className)} style={itemProps?.style}>
        {item.errors.map((i, idx) => {
          return (
            <li key={idx}>
              <CloseCircleOutlined className="u-danger" />
              {i}
            </li>
          );
        })}
        {item.warnings.map((i, idx) => {
          return (
            <li key={idx}>
              <WarningOutlined className="u-warning" />
              {i}
            </li>
          );
        })}
      </ul>
    );
  };

  if (Array.isArray(issues)) {
    return (
      <ul className={classNames('vd-editor-form-issues-group', s.group, className)} style={style}>
        {issues.map(i => {
          return (
            <li key={i.path} className={classNames('vd-editor-form-issues-group__item', s.groupItem)}>
              <div className={classNames('vd-editor-form-issues-group__name')}>{PATH_NAME[i.path] || i.path}</div>
              <div className={classNames('vd-editor-form-issues-group__body', s.groupBody)}>{renderItem(i)}</div>
            </li>
          );
        })}
      </ul>
    );
  } else {
    return renderItem(issues, { className, style });
  }
});
