import { FullScreenContainer } from '@/lib/components/FullScreenContainer';
import {
  BaseEditorModel,
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

import { CANVAS_MODEL_OPTIONS } from './ScenarioEditor';
import s from './ScenarioStandalone.module.scss';

export interface ScenarioStandaloneProps {
  dsl?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 独立的业务场景组件
 */
export const ScenarioStandalone = (props: ScenarioStandaloneProps) => {
  const { dsl, className, ...other } = props;
  const canvasModelRef = useRef<CanvasModel>();

  const model = useMemo(() => {
    if (dsl == null) {
      return;
    }

    const ydoc = createYDocFromBase64(dsl);

    return new BaseEditorModel({
      readonly: true,
      scopeId: 'scenario-standalone',
      activeScope: false,
      doc: ydoc,
      datasource: ydoc.getMap(YJS_FIELD_NAME.SCENARIO),
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
        <CanvasModelProvider options={CANVAS_MODEL_OPTIONS} onReady={handleCanvasReady}>
          <Canvas></Canvas>
        </CanvasModelProvider>
      </EditorModelProvider>
    </FullScreenContainer>
  );
};
