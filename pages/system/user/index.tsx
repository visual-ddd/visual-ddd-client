import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { getLayout } from '@/modules/layout';

export default function User() {
  return (
    <ProForm
      onFinish={async values => {
        console.log(values);
      }}
    >
      <ProFormText name="name" label="姓名" />
    </ProForm>
  );
}

User.getLayout = getLayout;
