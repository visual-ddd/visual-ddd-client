import {
  Canvas,
  CanvasModelOptions,
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

export const CANVAS_MODEL_OPTIONS: CanvasModelOptions = {
  onOptionsCreated(opts) {
    opts.highlighting!.embedding = {
      name: 'className',
      args: {
        // 暂时不显示泳道的嵌入高亮
        className: '',
      },
    };

    // 关闭内置的 panning
    // 使用 scroller 取代
    opts.panning = false;

    opts.scroller = {
      enabled: true,
      // pageBreak: true,
      // pageVisible: true,
      pannable: true,
      padding: 0,
      // autoResize: true
    };
  },
};

export const ScenarioEditor = observer(function ScenarioEditor(props: ScenarioEditorProps) {
  const { model } = props;
  const readonly = model.readonly;
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
        <CanvasModelProvider options={CANVAS_MODEL_OPTIONS}>
          <EditorConfigurationProvider value={configuration}>
            <EditorLayout
              left={
                !readonly && (
                  <EditorPanelLayout>
                    <EditorShapeLibrary shapes={model.shapeList} />
                  </EditorPanelLayout>
                )
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
