export interface IRateLimit {
  requestUsage(id: string, amount: number): Promise<boolean>;

  /**
   * 获取剩余配额
   * @param id
   */
  remainUsage(id: string): Promise<Record<string, number>>;
}
