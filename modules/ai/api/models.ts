import { allowMethod } from '@/lib/api';
import { getSupportedModels } from '../platform';
import { createSuccessResponse } from '@/modules/backend-node';

/**
 * 获取所有支持的模型
 */
export const getModels = allowMethod('GET', async (req, res) => {
  // TODO: 根据用户的当前的套件进行筛选
  const supported = getSupportedModels();

  res.json(createSuccessResponse(supported));
});
