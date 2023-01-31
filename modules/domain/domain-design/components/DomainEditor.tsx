import { observer } from 'mobx-react';

import {
  EditorModelProvider,
  Canvas,
  CanvasModelProvider,
  EditorLayout,
  EditorShapeLibrary,
  EditorToolbar,
  EditorInspectPanel,
  EditorPanelLayout,
  EditorConfigurationProvider,
  EditorConfigurationValue,
} from '@/lib/editor';
import { DomainEditorModel } from '../model';
import { ShapeTree } from './ShapeTree';
import { DomainObjectReferenceEdges } from './DomainObjectReferenceEdges';
import { useMemo } from 'react';
import { ShapeTitle } from './ShapeTitle';

export interface DomainEditorProps {
  /**
   * 编辑器模型
   */
  model: DomainEditorModel;

  /**
   * 是否处于激活状态
   */
  active?: boolean;
}

/**
 * 领域模型编辑器
 */
export const DomainEditor = observer(function DomainEditor(props: DomainEditorProps) {
  const { model } = props;
  const readonly = model.readonly;
  const configuration = useMemo<EditorConfigurationValue>(() => {
    return {
      renderTitle(node) {
        return <ShapeTitle nodeId={node.id} />;
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
                readonly ? (
                  <ShapeTree />
                ) : (
                  <EditorPanelLayout bottom={<ShapeTree />}>
                    <EditorShapeLibrary shapes={model.shapeList} />
                  </EditorPanelLayout>
                )
              }
              right={<EditorInspectPanel />}
              toolbar={<EditorToolbar />}
            >
              <Canvas>
                {/* 扩展连线 */}
                <DomainObjectReferenceEdges />
              </Canvas>
            </EditorLayout>
          </EditorConfigurationProvider>
        </CanvasModelProvider>
      </EditorModelProvider>
    </div>
  );
});
