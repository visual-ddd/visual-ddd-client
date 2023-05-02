/**
 * 客户端和服务端共享的内容
 */
export enum RequestControlErrorCode {
  /**
   * 不允许使用该功能
   */
  FeatureNotAllowed = 405,

  /**
   * 超出套餐使用范围，可能需要进行套餐升级
   */
  PlanExceed = 426,

  /**
   * 速率限制，可能是请求过滤频繁
   */
  RateLimit = 429,
}
