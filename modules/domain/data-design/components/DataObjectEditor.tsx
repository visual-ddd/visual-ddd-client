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

import { useMemo } from 'react';
import { DataObjectEditorModel } from '../model/DataObjectEditorModel';

import { DomainObjectReferenceEdges } from './DataObjectReferenceEdges';
import { ShapeTitle } from './ShapeTitle';
import { ShapeTree } from './ShapeTree';
import { useDataDesignBot } from '../bot-extension';

export interface DataObjectEditorProps {
  /**
   * 编辑器模型
   */
  model: DataObjectEditorModel;

  /**
   * 是否处于激活状态
   */
  active?: boolean;
}

const Bot = () => {
  useDataDesignBot();

  return null;
};

/**
 * 数据模型编辑器
 */
export const DataObjectEditor = observer(function DataObjectEditor(props: DataObjectEditorProps) {
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
              toolbar={<EditorToolbar></EditorToolbar>}
            >
              <Canvas>
                {/* 扩展连线 */}
                <DomainObjectReferenceEdges />
                <Bot />
              </Canvas>
            </EditorLayout>
          </EditorConfigurationProvider>
        </CanvasModelProvider>
      </EditorModelProvider>
    </div>
  );
});
