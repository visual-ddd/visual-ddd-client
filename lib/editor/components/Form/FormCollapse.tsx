import { Collapse } from 'antd';
import classNames from 'classnames';
import s from './FormCollapse.module.scss';
import { EditorFormTooltip } from './FormTooltip';

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

  extra?: React.ReactNode;

  /**
   * 文案提示
   */
  tooltip?: React.ReactNode;

  key: string;

  /**
   * 用于收集异常信息
   */
  path?: string;
}

export const EditorFormCollapsePanel = (props: EditorFormCollapsePanelProps) => {
  let { path, header, tooltip, ...other } = props;

  if (path) {
    header = (
      <>
        {header}
        <EditorFormTooltip path={path} aggregated className="u-ml-xs" tooltip={tooltip} />
      </>
    );
  }

  return <Collapse.Panel header={header} {...other}></Collapse.Panel>;
};
