import { createCommand, createDTO, createEntity, createQuery, createValueObject } from '../dsl/factory';
import { DomainObjectName } from '../dsl/constants';
import { createDomainObjectTransform } from './index';

describe('createDomainObjectTransform', () => {
  it('should be defined', () => {
    expect(createDomainObjectTransform).toBeDefined();
  });
  test.each([
    [DomainObjectName.Command, createCommand],
    [DomainObjectName.DTO, createDTO],
    [DomainObjectName.Entity, createEntity],
    [DomainObjectName.Query, createQuery],
    [DomainObjectName.ValueObject, createValueObject],
  ])(`test %p`, (name, factory) => {
    // @ts-expect-error
    const transform = createDomainObjectTransform(name, factory());

    expect(transform.toEntity()).toMatchObject({
      id: expect.any(String),
      isAggregationRoot: expect.any(Boolean),
      properties: expect.any(Array),
      methods: expect.any(Array),
    });

    expect(transform.toDTO()).toMatchObject({
      properties: expect.any(Array),
      methods: [],
    });

    expect(transform.toValueObject()).toMatchObject({
      properties: expect.any(Array),
      methods: expect.any(Array),
    });

    expect(transform.toQuery()).toMatchObject({
      source: expect.any(Object),
      properties: expect.any(Array),
      pagination: expect.any(Boolean),
      result: undefined,
    });

    expect(transform.toCommand()).toMatchObject({
      source: expect.any(Object),
      repository: expect.any(String),
      eventSendable: expect.any(Boolean),
      properties: expect.any(Array),
      eventProperties: expect.any(Array),
      aggregation: undefined,
      category: undefined,
      result: undefined,
    });
  });
});
