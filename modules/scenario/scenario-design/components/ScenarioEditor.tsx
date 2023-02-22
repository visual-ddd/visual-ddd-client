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

import { ScenarioEditorModel } from '../model';

export interface ScenarioEditorProps {
  model: ScenarioEditorModel;

  active?: boolean;
}

export const ScenarioEditor = observer(function ScenarioEditor(props: ScenarioEditorProps) {
  const { model } = props;
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
