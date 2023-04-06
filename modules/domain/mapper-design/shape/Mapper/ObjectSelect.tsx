import { observer, useLocalObservable } from 'mobx-react';
import { NameDSL } from '@/modules/domain/domain-design/dsl';
import { Cascader } from 'antd';
import { useMemo } from 'react';

import { ObjectReferenceDSL, ObjectReferenceSource } from '../../dsl';

import { Title } from './Title';

export interface IObjectGroup {
  key: string;
  label: string;
  list: NameDSL[];
}

export type IObjectDatasource = IObjectGroup[];

export interface ObjectSelectProps {
  datasource: () => IObjectDatasource;
  value?: ObjectReferenceDSL;
  onChange?: (value?: ObjectReferenceDSL) => void;
}

/**
 * 对象选择器
 */
export const ObjectSelect = observer(function ObjectSelect(props: ObjectSelectProps) {
  const { datasource, value, onChange } = props;
  const store = useLocalObservable(() => {
    return {
      get options() {
        const source = datasource();

        return source.map(group => ({
          value: group.key,
          label: group.label,
          disabled: group.list.length === 0,
          children: group.list.map(item => ({
            value: item.uuid,
            label: <Title value={item}></Title>,
          })),
        }));
      },
    };
  });

  const normalizedValue = useMemo(() => {
    if (value) {
      return [value.source!, value.referenceId!];
    }

    return undefined;
  }, [value]);

  const handleChange = (newValue: string[]) => {
    if (newValue?.length === 2) {
      onChange?.({
        source: newValue[0] as ObjectReferenceSource,
        referenceId: newValue[1],
      });
    } else {
      onChange?.();
    }
  };

  return (
    <Cascader
      showSearch
      className="u-fw"
      expandTrigger="click"
      placement="bottomRight"
      placeholder="请选择对象"
      options={store.options}
      value={normalizedValue}
      onChange={handleChange as any}
    ></Cascader>
  );
});
