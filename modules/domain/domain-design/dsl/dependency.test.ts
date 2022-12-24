import {
  extraDependenciesFromClass,
  extraDependenciesFromProperties,
  extraDependenciesFromTypeDSL,
} from './dependency';
import { TypeType } from './dsl';

test('extractDependenciesFromTypeDSL', () => {
  expect(
    extraDependenciesFromTypeDSL({
      type: TypeType.Base,
      name: 'Boolean',
    })
  ).toEqual([]);
  expect(
    extraDependenciesFromTypeDSL({
      type: TypeType.Reference,
      referenceId: 'ok',
      name: 'Ok',
    })
  ).toEqual(['ok']);
  expect(
    extraDependenciesFromTypeDSL({
      type: TypeType.Container,
      name: 'List',
      params: {
        item: {
          type: TypeType.Container,
          name: 'Map',
          params: {
            key: {
              type: TypeType.Reference,
              referenceId: 'ok',
              name: 'Ok',
            },
            value: {
              type: TypeType.Reference,
              referenceId: 'ok',
              name: 'Ok',
            },
          },
        },
      },
    })
  ).toEqual(['ok']);
});

test('extractDependenciesFromProperties', () => {
  expect(
    extraDependenciesFromProperties([
      {
        uuid: '1',
        type: {
          type: TypeType.Reference,
          name: 'Ok',
          referenceId: 'ok',
        },
        name: '1',
      },
      {
        uuid: '2',
        type: {
          type: TypeType.Reference,
          name: 'Ok',
          referenceId: 'ok',
        },
        name: '2',
      },
    ])
  ).toEqual(['ok']);
});

test('extraDependenciesFromClass', () => {
  expect(
    extraDependenciesFromClass({
      uuid: '1',
      name: 'A',
      properties: [
        {
          uuid: '1',
          type: {
            type: TypeType.Reference,
            name: 'Ok',
            referenceId: 'ok',
          },
          name: '1',
        },
        {
          uuid: '2',
          type: {
            type: TypeType.Reference,
            name: 'Ok',
            referenceId: 'ok',
          },
          name: '2',
        },
      ],
      classProperties: [],
      methods: [
        {
          uuid: '3',
          name: 'method',
          parameters: [],
          result: {
            type: TypeType.Reference,
            name: 'Ok',
            referenceId: 'foo',
          },
        },
      ],
      classMethods: [],
    })
  ).toEqual(['ok', 'foo']);
});
