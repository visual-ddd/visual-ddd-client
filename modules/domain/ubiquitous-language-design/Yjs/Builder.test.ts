import { Doc as YDoc, Map as YMap, Array as YArray } from 'yjs';
import { buildUbiquitousLanguageYjs } from './Builder';

function createDoc(): [YDoc, YArray<YMap<string>>] {
  const doc = new YDoc();
  const array = doc.getArray<YMap<string>>('test');

  return [doc, array];
}

test('buildUbiquitousLanguageYjs', () => {
  const [doc, array] = createDoc();

  buildUbiquitousLanguageYjs(
    [
      {
        conception: '1',
        englishName: '2',
        definition: '3',
        example: '4',
        restraint: '5',
      },
      {
        uuid: '4',
        conception: '5',
        englishName: '6',
        definition: '7',
        example: '8',
        restraint: '9',
      },
    ],
    array
  );

  expect(doc.toJSON()).toEqual({
    test: [
      {
        uuid: expect.any(String),
        conception: '1',
        englishName: '2',
        definition: '3',
        example: '4',
        restraint: '5',
      },
      {
        uuid: '4',
        conception: '5',
        englishName: '6',
        definition: '7',
        example: '8',
        restraint: '9',
      },
    ],
  });
});
