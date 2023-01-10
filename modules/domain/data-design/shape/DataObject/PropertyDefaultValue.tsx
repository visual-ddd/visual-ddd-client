/**
 * 字段默认值填写
 */

import { DatePicker, Input, InputNumber, Select } from 'antd';
import { observer } from 'mobx-react';
import React, { memo, useMemo } from 'react';
import dayjs from 'dayjs';

import { DataObjectTypeName, DATE_FORMAT, DATE_TIME_FORMAT } from '../../dsl';

export interface PropertyDefaultValueProps {
  type: DataObjectTypeName;
  value?: any;
  onChange?: (value?: any) => void;
}

const FormattedDatePicker = memo(
  (props: {
    format: string;
    value?: string;
    showTime?: boolean;
    onChange?: (value?: string) => void;
    className?: string;
    style?: React.CSSProperties;
  }) => {
    const { value, onChange, format, ...other } = props;

    const dayjsValue = useMemo(() => {
      if (value) {
        return dayjs(value, format);
      }
    }, [value, format]);

    const handleChange = (date: any, dateString: string) => {
      onChange?.(dateString);
    };

    return <DatePicker value={dayjsValue} format={format} onChange={handleChange} {...other}></DatePicker>;
  }
);

FormattedDatePicker.displayName = 'FormattedDatePicker';

export const PropertyDefaultValue = observer(function PropertyDefaultValue(props: PropertyDefaultValueProps) {
  const { type, value, onChange } = props;

  const commonProps = {
    value,
    onChange,
    className: 'u-fw',
    placeholder: '请输入默认值',
  };

  if (type === DataObjectTypeName.Boolean) {
    return (
      <Select
        {...commonProps}
        options={[
          { label: 'TRUE', value: true },
          { label: 'FALSE', value: false },
        ]}
      />
    );
  } else if (type === DataObjectTypeName.Date) {
    return <FormattedDatePicker {...commonProps} format={DATE_FORMAT}></FormattedDatePicker>;
  } else if (type === DataObjectTypeName.DateTime || type === DataObjectTypeName.Timestamp) {
    return <FormattedDatePicker {...commonProps} format={DATE_TIME_FORMAT} showTime></FormattedDatePicker>;
  } else if (type === DataObjectTypeName.Integer) {
    return <InputNumber {...commonProps} min={-2147483648} max={2147483647} precision={0} />;
  } else if (type === DataObjectTypeName.Long) {
    return <InputNumber {...commonProps} min={Number.MIN_SAFE_INTEGER} max={Number.MAX_SAFE_INTEGER} precision={0} />;
  } else if (
    type === DataObjectTypeName.Float ||
    type === DataObjectTypeName.Double ||
    type === DataObjectTypeName.Decimal
  ) {
    return <InputNumber {...commonProps} />;
  } else if (type === DataObjectTypeName.String) {
    return <Input {...commonProps}></Input>;
  }

  return null;
});
