import isObject from 'lodash/isObject';

import { ShapeCoreInfo } from './types';

export function assertShapeInfo(data: any): data is ShapeCoreInfo {
  return isObject(data) && (data as any).type != null;
}
