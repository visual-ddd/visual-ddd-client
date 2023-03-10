import { UbiquitousLanguageItem } from '../types';
import { Array as YArray, Map as YMap } from 'yjs';
import { ItemWrapper } from './ItemWrapper';
import { v4 } from 'uuid';

export type UbiquitousLanguageBuilderRepresentationItem = Omit<UbiquitousLanguageItem, 'uuid'> & { uuid?: string };

export function buildUbiquitousLanguageYjs(
  representation: UbiquitousLanguageBuilderRepresentationItem[],
  datasource: YArray<YMap<string>>
) {
  const createItem = (item: UbiquitousLanguageBuilderRepresentationItem) => {
    const map = ItemWrapper.from({ ...item, uuid: item.uuid ?? v4() }).toYMap();
    datasource.push([map]);

    return map;
  };

  return representation.map(createItem);
}
