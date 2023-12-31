import { useEditorModel } from '@/lib/editor';
import { NoopArray, arrayJoin } from '@wakeapp/utils';
import { Cascader, CascaderProps, Dropdown, Input } from 'antd';
import classNames from 'classnames';
import { action, computed, observable } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react';
import { cloneElement, createContext, isValidElement, useContext, useEffect, useMemo } from 'react';
import sortBy from 'lodash/sortBy';

import { DomainEditorModel, DomainObject, DomainObjectFactory } from '../../../model';
import { BaseType, BaseTypeInArray, ContainerType, ContainerTypeInArray, NameDSL, TypeDSL, TypeType } from '../../dsl';
import { createBaseType, createContainerType, createReferenceType } from '../../factory';
import { stringifyMethodResult, stringifyTypeDSL } from '../../stringify';
import s from './index.module.scss';
import { DomainObjectColors } from '../../constants';

export interface TypeInputProps {
  value?: TypeDSL;

  onChange?: (value?: TypeDSL) => void;

  onBlur?: () => void;

  /**
   * 是否为方法返回值，默认为 false
   *
   * 方法返回值为空时，需要序列化为 void
   */
  isMethodResult?: boolean;
}

type Node = {
  label: React.ReactNode;
  value: string;
  name: string;
  searchName?: string;
  disabled?: boolean;
  children?: Node[];
};

const STATIC_OPTIONS: Node[] = [
  {
    label: '基础类型',
    value: TypeType.Base,
    children: BaseTypeInArray.map(i => {
      return { label: i, value: i, name: i };
    }),
    name: '基础类型',
  },
  {
    label: '集合类型',
    value: TypeType.Container,
    children: ContainerTypeInArray.map(i => {
      return { label: i, value: i, name: i };
    }),
    name: '集合类型',
  },
];

export interface ReferenceTypeProviderProps {
  /**
   * false 表示不支持所有引用类型
   */
  filter?: false | ((type: DomainObject<NameDSL>) => boolean);
  children: React.ReactNode;
}

const CONTEXT_DEFAULT_VALUE = { references: NoopArray };
const CONTEXT = createContext<{ references: Node[] }>(CONTEXT_DEFAULT_VALUE);

export const ReferenceTypeProvider = observer(function ReferenceTypeProvider(props: ReferenceTypeProviderProps) {
  const { filter = true, children } = props;
  const { model } = useEditorModel<DomainEditorModel>();
  const store = useLocalObservable(() => {
    return {
      get references() {
        if (!filter) {
          return NoopArray;
        } else if (typeof filter === 'function') {
          return model.domainObjectStore.referableObjects.filter(filter);
        } else {
          return model.domainObjectStore.referableObjects;
        }
      },
      get options(): Node[] {
        return sortBy(this.references, i => {
          return [i.package?.name, i.name];
        }).map(i => {
          return {
            value: i.id,
            get disabled() {
              // 禁用聚合根
              return DomainObjectFactory.isAggregationRoot(i) ? true : undefined;
            },
            get label() {
              return (
                <div className={s.refLabel}>
                  {!!i.package && <span className={s.refParent}>{i.package.name} ➡️ </span>}
                  <span
                    className={s.refType}
                    style={{
                      // @ts-expect-error
                      '--color': DomainObjectColors[i.shapeName],
                    }}
                  >
                    {i.objectTypeTitle}
                  </span>
                  <span className={s.refName}>{i.readableTitle}</span>
                </div>
              );
            },
            get name() {
              return i.name;
            },
            get searchName() {
              return i.readableTitle;
            },
          };
        });
      },
      get context() {
        return { references: this.options };
      },
    };
  });

  return <CONTEXT.Provider value={store.context}>{children}</CONTEXT.Provider>;
});

const SEARCH_OPTIONS: CascaderProps['showSearch'] = {
  filter: (input, options, field) => {
    const last = options[options.length - 1] as Node;

    if (last.searchName) {
      return last.searchName.toLowerCase().includes(input.toLowerCase());
    }

    return last.name.toLowerCase().includes(input.toLowerCase());
  },
};

const TypeSelect = observer(function TypeSelect(props: { value?: TypeDSL; onChange?: (value: TypeDSL) => void }) {
  const { value, onChange } = props;
  const { references } = useContext(CONTEXT);

  const options = useMemo(() => {
    let options = STATIC_OPTIONS;

    if (references.length) {
      options = options.slice(0);

      options.push({
        label: '引用类型',
        value: TypeType.Reference,
        children: references,
        name: '引用类型',
      });
    }

    return options;
  }, [references]);

  const finalValue = useMemo(() => {
    if (value == null) {
      return NoopArray;
    }

    const v: string[] = [value.type];

    switch (value.type) {
      case TypeType.Reference: {
        if (value.referenceId) {
          v.push(value.referenceId);
        }
        break;
      }
      default: {
        v.push(value.name);
        break;
      }
    }

    return v;
  }, [value]);

  const handleChange = (v: [TypeType, string]) => {
    const [type, id] = v;

    let value: TypeDSL;

    switch (type) {
      case TypeType.Base:
        value = createBaseType(id as BaseType);
        break;
      case TypeType.Container:
        value = createContainerType(id as ContainerType);
        break;
      case TypeType.Reference: {
        const list = options.find(i => i.value === TypeType.Reference);
        const item = list!.children!.find(i => i.value === id)!;
        // 引用类型一定是存在的
        value = createReferenceType(id, item.name!);
        break;
      }
    }

    onChange?.(value);
  };

  return (
    <Cascader
      className={classNames('vd-type-constructor__type', s.ctorType)}
      options={options}
      value={finalValue}
      placeholder="选择类型"
      showSearch={SEARCH_OPTIONS}
      onChange={handleChange as any}
      expandTrigger="click"
      displayRender={(values, opts) => {
        return (
          <div className={s.cascaderDisplay}>
            {opts
              ? arrayJoin(
                  opts.filter(Boolean).map(i => i.label),
                  <span>/</span>
                ).map((i, idx) => (isValidElement(i) ? cloneElement(i, { key: idx }) : i))
              : null}
          </div>
        );
      }}
      placement="bottomLeft"
      autoFocus
      allowClear={false}
    ></Cascader>
  );
});

const TypeParams = observer(function TypeParams(props: {
  id: string;
  label: string;
  value: TypeDSL;
  onChange?: (value: TypeDSL) => void;
}) {
  const { label, id, value, onChange } = props;

  if (value.type !== TypeType.Container) {
    throw new Error('nerve');
  }

  const paramsValue = value.params[id];
  const handleChange = (newParamsValue: TypeDSL) => {
    const clone = { ...value };
    clone.params[id] = newParamsValue;

    onChange?.(clone);
  };

  return (
    <div className={classNames('vd-type-constructor__param', s.ctorParam)}>
      <span className={classNames('vd-type-constructor__label', s.ctorLabel)}>{label}</span>
      <TypeConstructor value={paramsValue} onChange={handleChange}></TypeConstructor>
    </div>
  );
});

const TypeConstructor = observer(function TypeConstructor(props: {
  value?: TypeDSL;
  onChange?: (value: TypeDSL) => void;
}) {
  const { value, onChange } = props;

  return (
    <div className={classNames('vd-type-constructor', s.ctor)}>
      <TypeSelect value={value} onChange={onChange}></TypeSelect>
      {value?.type === TypeType.Container && (
        <div className={classNames('vd-type-constructor__params', s.ctorParams)}>
          {value.name === 'Map' ? (
            <>
              <TypeParams id="key" label="键" value={value} onChange={onChange}></TypeParams>
              <TypeParams id="value" label="值" value={value} onChange={onChange}></TypeParams>
            </>
          ) : (
            <TypeParams id="item" label="子项" value={value} onChange={onChange}></TypeParams>
          )}
        </div>
      )}
    </div>
  );
});

export const TypeInput = observer(function TypeInput(props: TypeInputProps) {
  const { value, onChange, isMethodResult = false, onBlur } = props;
  const { model: editorModel } = useEditorModel<DomainEditorModel>();
  const store = useLocalObservable(
    () => {
      const getTitle = (id: string, name: string) => {
        const object = editorModel.domainObjectStore.getObjectById(id);

        return object?.readableTitle ?? name;
      };
      return {
        value: value,
        get inputValue() {
          if (isMethodResult) {
            return stringifyMethodResult(this.value, getTitle);
          }

          return stringifyTypeDSL(this.value, getTitle);
        },
        updateValue(val: typeof value) {
          this.value = val;
        },
      };
    },
    { value: observable.ref, inputValue: computed, updateValue: action }
  );

  useEffect(() => {
    store.updateValue(value);
  }, [value]);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (!e.target.value && value) {
      // clear
      onChange?.();
    }
  };

  const handleOpenChange = (visible: boolean) => {
    if (!visible) {
      onBlur?.();
    }
  };

  return (
    <Dropdown
      destroyPopupOnHide
      dropdownRender={() => {
        return (
          <div className={classNames('vd-type-input-menu', s.menu)}>
            <TypeConstructor value={value} onChange={onChange}></TypeConstructor>
          </div>
        );
      }}
      onOpenChange={handleOpenChange}
      trigger={['click']}
    >
      <Input value={store.inputValue} allowClear onChange={handleInputChange} placeholder="选择类型" />
    </Dropdown>
  );
});
