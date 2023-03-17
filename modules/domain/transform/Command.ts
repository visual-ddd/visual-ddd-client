import cloneDeep from 'lodash/cloneDeep';

import { CommandDSL } from '../domain-design/dsl';

import { PropertiesLike } from './PropertiesLike';

export class Command extends PropertiesLike<CommandDSL> {
  override clone() {
    const clone = super.clone();
    this.regenerateUUIDList(clone.eventProperties);

    return clone;
  }

  override toCommand() {
    return this.clone();
  }

  protected override cloneProperties() {
    // 合并事件参数
    return this.regenerateUUIDList(cloneDeep([...this.current.properties, ...this.current.eventProperties]))!;
  }
}
