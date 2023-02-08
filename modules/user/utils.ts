import { ORG_TYPE } from './constants';

export interface LaunchConfig {
  type: ORG_TYPE;
  organizationId?: number;
  teamId?: number;
}

const LAUNCH_CONFIG_KEY = 'LAUNCH_CONFIG';

/**
 * 缓存启动页配置
 * @param launchConfig
 */
export function setLaunchConfig(launchConfig: LaunchConfig) {
  localStorage.setItem(LAUNCH_CONFIG_KEY, JSON.stringify(launchConfig));
}

/**
 * 获取启动配置
 * @returns launchConfig
 */
export function getLaunchConfig(): LaunchConfig | undefined {
  const launchConfig = localStorage.getItem(LAUNCH_CONFIG_KEY);
  if (launchConfig) {
    return JSON.parse(launchConfig);
  }
  return;
}
