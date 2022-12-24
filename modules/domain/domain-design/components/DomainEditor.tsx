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
} from '@/lib/editor';
import { DomainEditorModel } from '../model';
import { ShapeTree } from './ShapeTree';

const ydoc = new YDoc();
const domainDatabase = ydoc.getMap('domain');

// new IndexeddbPersistence('just-do-it', ydoc);
new WebrtcProvider('just-do-it', ydoc);

const model = new DomainEditorModel({ datasource: domainDatabase, doc: ydoc });

/**
 * 领域模型编辑器
 */
export const DomainEditor = observer(function DomainEditor() {
  return (
    <div>
      <EditorModelProvider value={model}>
        <CanvasModelProvider>
          <EditorLayout
            left={
              <EditorPanelLayout bottom={<ShapeTree />}>
                <EditorShapeLibrary
                  shapes={['entity', 'value-object', 'aggregation', 'rect', 'rect-child', 'child', 'child-2', 'react']}
                />
              </EditorPanelLayout>
            }
            right={<EditorInspectPanel />}
            toolbar={<EditorToolbar />}
          >
            <Canvas>{/* TODO: 扩展连线 */}</Canvas>
          </EditorLayout>
        </CanvasModelProvider>
      </EditorModelProvider>
    </div>
  );
});
