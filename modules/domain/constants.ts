/**
 * YJS 字段
 */
export enum YJS_FIELD_NAME {
  // 产品资料
  PRODUCT = 'product',
  // 产品愿景
  VISION = 'vision',
  // 统一语言
  UBIQUITOUS_LANGUAGE = 'ubiquitous-language',
  // 领域模型
  DOMAIN = 'domain',
  // 查询模型
  QUERY = 'query',
  // 数据对象
  DATA_OBJECT = 'data-object',
  // 对象映射
  MAPPER = 'mapper',
}

export enum DomainDesignerTabs {
  Product = 'product',
  Vision = 'vision',
  UbiquitousLanguage = 'ubiquitousLanguage',
  DomainModel = 'domainModel',
  QueryModel = 'queryModel',
  DataModel = 'dataModel',
  Mapper = 'mapper',
}

export const DomainDesignerTabsMap = {
  [DomainDesignerTabs.Product]: '需求资料',
  [DomainDesignerTabs.Vision]: '产品愿景',
  [DomainDesignerTabs.UbiquitousLanguage]: '统一语言',
  [DomainDesignerTabs.DomainModel]: '领域模型',
  [DomainDesignerTabs.QueryModel]: '查询模型',
  [DomainDesignerTabs.DataModel]: '数据模型',
  [DomainDesignerTabs.Mapper]: '对象结构映射',
};
