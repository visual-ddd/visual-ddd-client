import { ExclamationCircleFilled } from '@ant-design/icons';
import { Tabs, Tooltip } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { useCanvasModel } from '../../Canvas';
import { useCanvasModelCommandDescription, usePropertyLocationSatisfy } from '../../hooks';
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

  const getCommandDesc = useCanvasModelCommandDescription();

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
      tabBarGutter={30}
      activeKey={viewStore.viewState.inspectTab}
      onChange={handleTabChange as any}
      items={[
        {
          label: (
            <Tooltip title={getCommandDesc('showAttributes').tooltip} placement="bottomRight" mouseEnterDelay={1}>
              <span>属性</span>
            </Tooltip>
          ),
          key: EditorInspectTab.Attributes,
          children: <EditorAttributes />,
        },
        {
          label: (
            <Tooltip title={getCommandDesc('showProblems').tooltip} placement="bottomRight" mouseEnterDelay={1}>
              <span>
                告警
                {!!hasIssue && (
                  <ExclamationCircleFilled className={hasError ? 'u-danger' : 'u-warning'} style={{ marginLeft: 4 }} />
                )}
              </span>
            </Tooltip>
          ),
          key: EditorInspectTab.Problems,
          children: <EditorProblems />,
        },
      ]}
    ></Tabs>
  );
});
