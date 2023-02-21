import {
  Canvas,
  CanvasModelProvider,
  EditorConfigurationProvider,
  EditorConfigurationValue,
  EditorInspectPanel,
  EditorLayout,
  EditorModelProvider,
  EditorPanelLayout,
  EditorShapeLibrary,
  EditorToolbar,
} from '@/lib/editor';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { Doc as YDoc } from 'yjs';
import { ScenarioObjectName } from '../dsl';

import { ScenarioEditorModel } from '../model';

export interface ScenarioEditorProps {}

const doc = new YDoc();

const model = new ScenarioEditorModel({
  scopeId: 'scenario',
  activeScope: true,
  shapeList: [
    ScenarioObjectName.Lane,
    ScenarioObjectName.Start,
    ScenarioObjectName.End,
    ScenarioObjectName.Activity,
    ScenarioObjectName.Decision,
  ],
  whitelist: [
    ScenarioObjectName.Start,
    ScenarioObjectName.End,
    ScenarioObjectName.Activity,
    ScenarioObjectName.NormalEdge,
    ScenarioObjectName.Decision,
  ],
  doc,
  datasource: doc.getMap('scenario'),
});

export const ScenarioEditor = observer(function ScenarioEditor(props: ScenarioEditorProps) {
  const configuration = useMemo<EditorConfigurationValue>(() => {
    return {
      renderTitle(node) {
        return node.name;
      },
    };
  }, []);

  return (
    <div>
      <EditorModelProvider value={model}>
        <CanvasModelProvider>
          <EditorConfigurationProvider value={configuration}>
            <EditorLayout
              left={
                <EditorPanelLayout>
                  <EditorShapeLibrary shapes={model.shapeList} />
                </EditorPanelLayout>
              }
              right={<EditorInspectPanel />}
              toolbar={<EditorToolbar />}
            >
              <Canvas></Canvas>
            </EditorLayout>
          </EditorConfigurationProvider>
        </CanvasModelProvider>
      </EditorModelProvider>
    </div>
  );
});
