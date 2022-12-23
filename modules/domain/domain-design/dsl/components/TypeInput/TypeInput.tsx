import { NoopArray } from '@wakeapp/utils';
import { Cascader, Dropdown, Input } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { BaseType, BaseTypeInArray, ContainerType, ContainerTypeInArray, TypeDSL, TypeType } from '../../dsl';
import { createBaseType, createContainerType, createReferenceType } from '../../factory';
import { stringifyMethodResult, stringifyTypeDSL } from '../../stringify';
import s from './index.module.scss';

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
  label: string;
  value: string;
  children?: Node[];
};

const STATIC_OPTIONS: Node[] = [
  {
    label: '基础类型',
    value: TypeType.Base,
    children: BaseTypeInArray.map(i => {
      return { label: i, value: i };
    }),
  },
  {
    label: '集合类型',
    value: TypeType.Container,
    children: ContainerTypeInArray.map(i => {
      return { label: i, value: i };
    }),
  },
  {
    label: '引用类型',
    value: TypeType.Reference,
    children: [],
  },
];

const TypeSelect = observer(function TypeSelect(props: { value?: TypeDSL; onChange?: (value: TypeDSL) => void }) {
  const { value, onChange } = props;

  const options = useMemo(() => {
    // TODO: 注入引用类型
    return STATIC_OPTIONS.filter(i => i.children?.length);
  }, []);

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
        value = createReferenceType(id, item.label);
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
      onChange={handleChange as any}
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

  const inputValue = useMemo(() => {
    if (isMethodResult) {
      return stringifyMethodResult(value);
    }

    return stringifyTypeDSL(value);
  }, [value, isMethodResult]);

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
      <Input value={inputValue} allowClear onChange={handleInputChange} placeholder="选择类型" />
    </Dropdown>
  );
});
