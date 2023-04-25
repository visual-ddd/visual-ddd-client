import { ObjectMeta, ValueType, NameDSL, ApplicationDSL, WithVersion } from './protocol';

export const NAME_DSL_META: ObjectMeta<NameDSL> = {
  uuid: ValueType.Atom,
  name: ValueType.Atom,
  title: ValueType.Atom,
  description: ValueType.Atom,
  meta: ValueType.Atom,
  __delta: ValueType.Never,
};

export const VERSION_DSL_META: ObjectMeta<WithVersion> = {
  version: ValueType.Atom,
};

/**
 * 应用 DSL meta
 */
export const APPLICATION_DSL_META: ObjectMeta<ApplicationDSL> = {
  ...NAME_DSL_META,
  ...VERSION_DSL_META,
  businessDomains: ValueType.Atom,
  businessScenarios: ValueType.Atom,
};
