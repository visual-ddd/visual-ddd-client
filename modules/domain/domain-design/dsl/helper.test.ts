import { isTypeDSLEqual } from './helper';
import { createBaseType, createContainerType, createReferenceType } from './factory';

test('isTypeDSLEqual', () => {
  expect(isTypeDSLEqual(createBaseType('BigDecimal'), createBaseType('BigDecimal'))).toBe(true);
  expect(isTypeDSLEqual(createBaseType('Long'), createBaseType('BigDecimal'))).toBe(false);

  expect(isTypeDSLEqual(createBaseType('Long'), createContainerType('List'))).toBe(false);

  const list1 = createContainerType('List');
  list1.params.item = createBaseType('Long');

  const list2 = createContainerType('List');
  list2.params.item = createBaseType('Long');

  const list3 = createContainerType('List');
  list3.params.item = createBaseType('Byte');

  expect(isTypeDSLEqual(list1, list2)).toBe(true);
  expect(isTypeDSLEqual(list1, list3)).toBe(false);

  expect(isTypeDSLEqual(createReferenceType('1', 'User'), createReferenceType('1', 'User'))).toBe(true);
  expect(isTypeDSLEqual(createReferenceType('1', 'User'), createReferenceType('1', 'Another'))).toBe(true);
  expect(isTypeDSLEqual(createReferenceType('1', 'User'), createReferenceType('2', 'Another'))).toBe(false);

  // 递归
  list1.params.item = createReferenceType('1', 'User');
  list2.params.item = createReferenceType('1', 'User');
  expect(isTypeDSLEqual(list1, list2)).toBe(true);
});
