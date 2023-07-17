/**
 * 机器人元数据
 */
export interface BotMeta {
  /**
   * 机器人名称
   */
  name: string;

  /**
   * 系统 prompt
   */
  system: string;

  /**
   * 模型
   */
  model?: string;

  /**
   * 模型温度，默认 0.7
   */
  temperature?: number;

  /**
   * 最大上下文消息数
   */
  maxContextLength?: number;
}

/**
 * 主题
 */
export interface Prompt {
  uuid: string;

  /**
   * 标题
   */
  name: string;

  /**
   * 简短描述
   */
  description?: string;

  /**
   * 介绍，markdown 格式
   */
  introduction?: string;

  /**
   * 系统 prompt
   */
  system: string;

  /**
   * 贡献者
   */
  author: string;

  /**
   * 分类
   */
  category: string[];

  /**
   * 提交日期
   */
  date: `${number}/${number}/${number}`;

  // 以下是一些高级配置
  /**
   * 模型文档，默认是 0.7
   */
  temperature?: number;

  /**
   * 最大上下文消息数
   */
  maxContextLength?: number;
}
