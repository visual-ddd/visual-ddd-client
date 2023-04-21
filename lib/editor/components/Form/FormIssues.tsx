import { BulbFilled, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { usePropertyLocationNavigate } from '../../hooks';
import { FormItemValidateStatus, FormModel, ROOT_FIELD } from '../../Model';

import s from './FormIssues.module.scss';

export interface EditorFormIssuesProps {
  issues: FormItemValidateStatus | FormItemValidateStatus[];
  formModel: FormModel;
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
  const { issues, formModel, className, style } = props;
  const openProperty = usePropertyLocationNavigate();

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
        {item.tips.map((i, idx) => {
          return (
            <li key={idx}>
              <BulbFilled className="u-warning" />
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
          const handleClick = (evt: React.MouseEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            openProperty({ nodeId: formModel.id, path: i.path });
          };

          return (
            <li key={i.path} className={classNames('vd-editor-form-issues-group__item', s.groupItem)}>
              <div className={classNames('vd-editor-form-issues-group__name', 'u-link')} onClick={handleClick}>
                {PATH_NAME[i.path] || i.path}
              </div>
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
