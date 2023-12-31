import type { Doc as YDoc } from 'yjs';
import { FullScreenContainer } from '@/lib/components/FullScreenContainer';
import {
  Canvas,
  CanvasModel,
  CanvasModelProvider,
  EditorModelProvider,
  NoopBaseEditorAwarenessRegistry,
} from '@/lib/editor';
import { tryDispose } from '@/lib/utils';
import { createYDocFromBase64 } from '@/lib/yjs-store-api-for-browser';
import { NoopArray } from '@wakeapp/utils';
import { Empty } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useRef } from 'react';

import { YJS_FIELD_NAME } from '../../constants';
import { DomainEditorModel } from '../model';
import { DomainObjectReferenceEdges } from './DomainObjectReferenceEdges';

import s from './StandaloneDomainEditor.module.scss';

export interface StandaloneDomainProps {
  dsl?: string | YDoc;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 独立的领域模型组件
 */
export const StandaloneDomainEditor = (props: StandaloneDomainProps) => {
  const { dsl, className, ...other } = props;
  const canvasModelRef = useRef<CanvasModel>();

  const model = useMemo(() => {
    if (dsl == null) {
      return;
    }

    const ydoc = typeof dsl === 'string' ? createYDocFromBase64(dsl) : dsl;

    return new DomainEditorModel({
      readonly: true,
      scopeId: 'domain-standalone',
      activeScope: false,
      doc: ydoc,
      datasource: ydoc.getMap(YJS_FIELD_NAME.DOMAIN),
      whitelist: NoopArray,
      shapeList: NoopArray,
      awarenessRegistry: new NoopBaseEditorAwarenessRegistry(),
    });
  }, [dsl]);

  useEffect(() => {
    if (model) {
      return () => tryDispose(model);
    }
  }, [model]);

  const handleFullScreenChange = () => {
    setTimeout(() => {
      canvasModelRef.current?.handleZoomToFit();
    }, 500);
  };

  const handleCanvasReady = (canvasModel: CanvasModel) => {
    canvasModelRef.current = canvasModel;

    handleFullScreenChange();
  };

  if (model == null) {
    return <Empty description="暂无数据" />;
  }

  return (
    <FullScreenContainer
      className={classNames(s.root, className)}
      onFullScreenChange={handleFullScreenChange}
      {...other}
    >
      <EditorModelProvider value={model}>
        <CanvasModelProvider onReady={handleCanvasReady}>
          <Canvas>
            <DomainObjectReferenceEdges />
          </Canvas>
        </CanvasModelProvider>
      </EditorModelProvider>
    </FullScreenContainer>
  );
};
