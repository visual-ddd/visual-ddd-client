import { DataObjectReferenceCardinality, DataObjectTypeName } from '../dsl/dsl';

export namespace AIImport {
  export interface DataObjectReferenceType {
    type: DataObjectTypeName.Reference;
    target: string;
    property: string;
    cardinality: DataObjectReferenceCardinality;
  }

  export interface DataObjectNormalType {
    type: Exclude<DataObjectTypeName, DataObjectTypeName.Reference>;
  }

  export interface DataObjectProperty {
    name: string;
    title: string;
    primaryKey?: boolean;
    type: DataObjectNormalType | DataObjectReferenceType;
  }

  export interface DataObject {
    name: string;
    title: string;
    properties: DataObjectProperty[];
  }
}
