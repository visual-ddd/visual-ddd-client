import { useRefValue } from '@wakeapp/hooks';
import { useEffect } from 'react';
import { BaseEditorPropertyLocationObserver, EditorPropertyLocation, useEditorModel } from '../Model';

export function usePropertyLocationSatisfy(params: {
  nodeId?: string;
  path?: string;
  onSatisfy: (evt: { location: EditorPropertyLocation; observer: BaseEditorPropertyLocationObserver }) => void;

  /**
   * 是否在路径已经被 touch 时仍然触发, 默认 false
   * 仅支持 path 不为空的场景
   */
  satisfyOnTouched?: boolean;

  /**
   * 是否在满足条件时自动 touch, 默认 true
   * 仅支持 path 不为空的场景
   */
  touchOnSatisfy?: boolean;
}) {
  const { nodeId, path } = params;
  const { model } = useEditorModel();
  const observer = model.propertyLocationObserver;
  const paramsRef = useRefValue(params);

  useEffect(() => {
    if (nodeId == null) {
      return;
    }

    const call = (location: EditorPropertyLocation) => {
      // 已经处理过
      if (paramsRef.current.satisfyOnTouched !== true && path != null && observer.isTouched(path)) {
        return;
      }

      paramsRef.current.onSatisfy({ location, observer });

      if (paramsRef.current.touchOnSatisfy !== false && path != null) {
        observer.touch(path);
      }
    };

    const currentLocation = observer.peek();
    if (currentLocation && observer.satisfy(nodeId, path)) {
      call(currentLocation);
    }

    // 订阅
    return observer.subscribe(nodeId, path, evt => {
      call(evt);
    });
  }, [observer, nodeId, path, paramsRef]);
}
