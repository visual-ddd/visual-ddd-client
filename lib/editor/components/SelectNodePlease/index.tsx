import { Empty } from 'antd';
import { memo } from 'react';

export const SelectNodePlease = memo((props: { description?: React.ReactNode }) => {
  return (
    <div style={{ width: '100%', height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Empty description={props.description ?? '请选择图形'}></Empty>
    </div>
  );
});

SelectNodePlease.displayName = 'SelectNodePlease';
