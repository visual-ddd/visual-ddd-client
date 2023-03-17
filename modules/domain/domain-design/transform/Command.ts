import cloneDeep from 'lodash/cloneDeep';
import { CommandDSL, PropertiesLikeDSL } from '../dsl';
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

  protected override mergeBaseInfo(target: PropertiesLikeDSL): PropertiesLikeDSL {
    const result = super.mergeBaseInfo(target);

    if (this.current.eventProperties.length) {
      // 合并事件属性
      for (const p of this.current.eventProperties) {
        result.properties.push(this.regenerateUUID(cloneDeep(p)));
      }
    }

    return result;
  }
}
