import {
  BaseEditorModel,
  Canvas,
  CanvasModelProvider,
  EditorModelProvider,
  NoopBaseEditorAwarenessRegistry,
} from '@/lib/editor';
import { tryDispose } from '@/lib/utils';
import { createYDocFromBase64 } from '@/lib/yjs-store-api-for-browser';
import { NoopArray } from '@wakeapp/utils';
import { Empty } from 'antd';
import { useEffect, useMemo } from 'react';

import { YJS_FIELD_NAME } from '../../constants';

import { CANVAS_MODEL_OPTIONS } from './ScenarioEditor';
import s from './ScenarioStandalone.module.scss';

export interface ScenarioStandaloneProps {
  dsl?: string;
}

/**
 * 独立的业务场景组件
 */
export const ScenarioStandalone = (props: ScenarioStandaloneProps) => {
  const { dsl } = props;

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

  if (model == null) {
    return <Empty description="暂无数据" />;
  }

  return (
    <div className={s.root}>
      <EditorModelProvider value={model}>
        <CanvasModelProvider options={CANVAS_MODEL_OPTIONS}>
          <Canvas></Canvas>
        </CanvasModelProvider>
      </EditorModelProvider>
    </div>
  );
};
