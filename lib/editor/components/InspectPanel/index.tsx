import { ExclamationCircleFilled } from '@ant-design/icons';
import { Tabs } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { useCanvasModel } from '../../Canvas';
import { EditorAttributes } from '../Attributes';
import { EditorProblems } from '../Problems';

import s from './index.module.scss';

export const EditorInspectPanel = observer(function EditorInspectPanel() {
  const { model } = useCanvasModel();
  const viewStore = model.editorViewStore;
  const formStore = model.editorFormStore;

  const node = viewStore.focusingNode;
  const formModel = node && formStore.getFormModel(node);
  const hasIssue = formModel ? formModel.hasIssue : formStore.hasIssue;
  const hasError = hasIssue && (formModel ? formModel.hasError : formStore.hasError);

  return (
    <Tabs
      className={classNames('vd-inspect-panel', s.root)}
      centered
      // type="card"
      size="small"
      tabBarGutter={16}
      items={[
        {
          label: '属性',
          key: 'attribute',
          children: <EditorAttributes />,
        },
        {
          label: (
            <span>
              告警
              {!!hasIssue && (
                <ExclamationCircleFilled className={hasError ? 'u-danger' : 'u-warning'} style={{ marginLeft: 4 }} />
              )}
            </span>
          ),
          key: 'problems',
          children: <EditorProblems />,
        },
      ]}
    ></Tabs>
  );
});
