import { CommandDSL } from '../dsl';
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
}
