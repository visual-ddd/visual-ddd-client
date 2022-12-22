import { Collapse } from 'antd';
import classNames from 'classnames';
import s from './FormCollapse.module.scss';

export interface EditorFormCollapseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  defaultActiveKey?: string[];
}

export const EditorFormCollapse = (props: EditorFormCollapseProps) => {
  return (
    <Collapse
      expandIconPosition="start"
      ghost
      bordered={false}
      collapsible="header"
      {...props}
      className={classNames('vd-form-collapse', props.className, s.root)}
    ></Collapse>
  );
};

export interface EditorFormCollapsePanelProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  header: React.ReactNode;
  key: string;

  // TODO: 用于收集异常信息
  path?: string;
}

export const EditorFormCollapsePanel = (props: EditorFormCollapsePanelProps) => {
  return <Collapse.Panel {...props}></Collapse.Panel>;
};
