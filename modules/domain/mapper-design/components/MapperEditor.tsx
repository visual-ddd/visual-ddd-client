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

import { MapperEditorModel } from '../model';

export interface MapperEditorProps {
  /**
   * 编辑器模型
   */
  model: MapperEditorModel;
  active?: boolean;
}

export const MapperEditor = observer(function MapperEditor(props: MapperEditorProps) {
  const { model } = props;
  const readonly = model.readonly;
  const configuration = useMemo<EditorConfigurationValue>(() => {
    return {
      renderTitle(node) {
        return node.name;
        // return <ShapeTitle nodeId={node.id} />;
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
                readonly ? undefined : (
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
