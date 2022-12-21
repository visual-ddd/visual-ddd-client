import { CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { FormItemValidateStatus } from '../../Model';

import s from './FormIssues.module.scss';

export interface EditorFormIssuesProps {
  issues: FormItemValidateStatus | FormItemValidateStatus[];
}

/**
 * 告警信息渲染
 */
export const EditorFormIssues = observer(function EditorFormIssues(props: EditorFormIssuesProps) {
  const { issues } = props;
  const renderItem = (item: FormItemValidateStatus) => {
    return (
      <ul className={classNames('vd-editor-form-issues-list', s.list)}>
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
      <ul className={classNames('vd-editor-form-issues-group', s.group)}>
        {issues.map(i => {
          return (
            <li key={i.path} className={classNames('vd-editor-form-issues-group__item', s.groupItem)}>
              <div className={classNames('vd-editor-form-issues-group__name')}>{i.path}</div>
              <div className={classNames('vd-editor-form-issues-group__body', s.groupBody)}>{renderItem(i)}</div>
            </li>
          );
        })}
      </ul>
    );
  } else {
    return renderItem(issues);
  }
});
