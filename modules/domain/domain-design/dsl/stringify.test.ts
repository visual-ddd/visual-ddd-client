import { stringifyTypeDSLToTypescript } from './stringify';
import { createBaseType, createContainerType, createReferenceType } from './factory';

test('stringifyTypeDSLToTypescript', () => {
  expect(stringifyTypeDSLToTypescript()).toBe('unknown');
  expect(stringifyTypeDSLToTypescript(createBaseType('Boolean'))).toBe('boolean');
  expect(stringifyTypeDSLToTypescript(createBaseType('BigDecimal'))).toBe('number');

  const list = createContainerType('List');
  list.params.item = createBaseType('Integer');
  expect(stringifyTypeDSLToTypescript(list)).toBe('number[]');

  const map = createContainerType('Map');
  map.params.key = createBaseType('Integer');
  map.params.value = createBaseType('Double');
  expect(stringifyTypeDSLToTypescript(map)).toBe('Map<number, number>');

  expect(stringifyTypeDSLToTypescript(createReferenceType('uuid', 'Name'))).toBe('Name');
});
