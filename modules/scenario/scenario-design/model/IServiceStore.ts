import type { NameDSL } from '@/modules/domain/domain-design/dsl';

export interface IServiceStore {
  /**
   * 服务列表
   */
  list: NameDSL[];

  /**
   * 通过 id 获取服务
   * @param id
   */
  getObjectById(id: string): NameDSL | undefined;

  /**
   * 打开服务
   * @param id
   */
  openObjectById(id: string): void;
}
