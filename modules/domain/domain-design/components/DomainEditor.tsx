import { observer } from 'mobx-react';
import { Doc as YDoc } from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

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

const ydoc = new YDoc();
const domainDatabase = ydoc.getMap('domain');

// new IndexeddbPersistence('just-do-it', ydoc);
new WebrtcProvider('just-do-it', ydoc);

const model = new DomainEditorModel({ datasource: domainDatabase, doc: ydoc });

/**
 * 领域模型编辑器
 */
export const DomainEditor = observer(function DomainEditor() {
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
                <EditorPanelLayout bottom={<ShapeTree />}>
                  <EditorShapeLibrary
                    shapes={['entity', 'value-object', 'enum', 'aggregation', 'command', 'rule', 'activity', 'comment']}
                  />
                </EditorPanelLayout>
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
