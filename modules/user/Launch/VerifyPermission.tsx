import { useDeviceCheck } from '@/modules/session';
import { useVerifyPermission } from './useVerifyPermission';

/**
 * 验证访问权限
 * @returns
 */
export const VerifyPermission = () => {
  useVerifyPermission();
  useDeviceCheck();

  return null;
};

export default VerifyPermission;
