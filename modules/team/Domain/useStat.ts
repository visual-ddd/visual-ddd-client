import { BusinessDomainDSL } from '@/modules/domain/api/dsl/interface';

export function useStat(dsl?: BusinessDomainDSL) {
  if (!dsl) {
    return;
  }

  return {
    /**
     * 领域对象
     * 命令、实体、值对象、枚举
     */
    domainObject: dsl.domainModel.aggregates.reduce((prev, cur) => {
      return (
        prev +
        cur.commands.length +
        (cur.entities?.length ?? 0) +
        (cur.valueObjects?.length ?? 0) +
        (cur.enums?.length ?? 0) +
        // 聚合根
        1
      );
    }, 0),
    /**
     * 数据对象
     */
    dataObject: dsl.dataModel.dataObjects.length,

    /**
     * 统一语言
     */
    ubiquitousLanguage: dsl.ubiquitousLanguage?.length ?? 0,

    /**
     * 业务能力
     * 命令 + 查询
     */
    businessCapability:
      dsl.domainModel.aggregates.reduce((prev, cur) => {
        return prev + cur.commands.length;
      }, 0) + dsl.queryModel.queries.length,

    // TODO: 被关联应用、业务场景
  };
}
