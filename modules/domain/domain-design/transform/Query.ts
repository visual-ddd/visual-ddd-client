import { QueryDSL } from '../dsl/dsl';

import { PropertiesLike } from './PropertiesLike';

export class Query extends PropertiesLike<QueryDSL> {
  override toQuery(): QueryDSL {
    return this.clone();
  }
}
