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
import { DataObjectEditorModel } from '../model';

import s from './StandaloneDataObjectEditor.module.scss';

export interface StandaloneDataObjectProps {
  dsl?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 独立的数据模型组件
 */
export const StandaloneDataObjectEditor = (props: StandaloneDataObjectProps) => {
  const { dsl, className, ...other } = props;
  const canvasModelRef = useRef<CanvasModel>();

  const model = useMemo(() => {
    if (dsl == null) {
      return;
    }

    const ydoc = createYDocFromBase64(dsl);

    return new DataObjectEditorModel({
      readonly: true,
      scopeId: 'data-object-standalone',
      activeScope: false,
      doc: ydoc,
      datasource: ydoc.getMap(YJS_FIELD_NAME.DATA_OBJECT),
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
          <Canvas></Canvas>
        </CanvasModelProvider>
      </EditorModelProvider>
    </FullScreenContainer>
  );
};
