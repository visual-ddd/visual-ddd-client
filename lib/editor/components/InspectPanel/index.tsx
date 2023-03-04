import { ExclamationCircleFilled } from '@ant-design/icons';
import { Tabs } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { useCanvasModel } from '../../Canvas';
import { usePropertyLocationSatisfy } from '../../hooks';
import { EditorInspectTab } from '../../Model';
import { EditorAttributes } from '../Attributes';
import { EditorProblems } from '../Problems';

import s from './index.module.scss';

export const EditorInspectPanel = observer(function EditorInspectPanel() {
  const { model } = useCanvasModel();
  const viewStore = model.editorViewStore;
  const formStore = model.editorFormStore;
  const commandHandler = model.editorCommandHandler;

  const node = viewStore.focusingNode;
  const formModel = node && formStore.getFormModel(node);
  const hasIssue = formModel ? formModel.hasIssue : formStore.hasIssue;
  const hasError = hasIssue && (formModel ? formModel.hasError : formStore.hasError);

  const handleTabChange = (key: EditorInspectTab) => {
    commandHandler.setViewState({ key: 'inspectTab', value: key });
  };

  usePropertyLocationSatisfy({
    nodeId: formModel?.id,
    onSatisfy(evt) {
      if (evt.location.path && !evt.observer.isTouched('__TAB__')) {
        evt.observer.touch('__TAB__');
        // 激活属性面板
        handleTabChange(EditorInspectTab.Attributes);
      }
    },
  });

  return (
    <Tabs
      className={classNames('vd-inspect-panel', s.root)}
      centered
      // type="card"
      size="small"
      tabBarGutter={16}
      activeKey={viewStore.viewState.inspectTab}
      onChange={handleTabChange as any}
      items={[
        {
          label: '属性',
          key: EditorInspectTab.Attributes,
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
          key: EditorInspectTab.Problems,
          children: <EditorProblems />,
        },
      ]}
    ></Tabs>
  );
});
