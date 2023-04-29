export enum ModelName {
  GPT35 = 'gpt3.5',
}

export interface Usage {
  /**
   * 原始消耗
   */
  consumer: number;

  /**
   * 模型名称
   */
  model: string;

  /**
   * 用户ID
   */
  userId: string;

  /**
   * 时间
   */
  createDate: number;

  /**
   * 消耗点数 基于 GPT 3.5 换算
   */
  point: number;

  /**
   * 备注信息
   */
  note: string;
}
