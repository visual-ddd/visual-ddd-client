import { Mapper } from '../../model';

import { FieldMapperDisplay } from './FieldMapperDisplay';

export function reactifyMapper(sourceFieldId: string | undefined, targetFieldId: string | undefined, mapper: Mapper) {
  return <FieldMapperDisplay sourceFieldId={sourceFieldId} targetFieldId={targetFieldId} mapper={mapper} />;
}
