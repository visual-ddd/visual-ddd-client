import { EditorFormItem } from '@/lib/editor';
import { Input } from 'antd';
import { observer } from 'mobx-react';

export interface ExternalServiceEditorProps {}

export const ExternalServiceEditor = observer(function ExternalServiceEditor(props: ExternalServiceEditorProps) {
  return (
    <>
      <EditorFormItem path="binding.serviceName" label="服务名称">
        <Input placeholder="外部服务名称" />
      </EditorFormItem>
      <EditorFormItem path="binding.serviceDescription" label="服务描述">
        <Input.TextArea placeholder="外部服务描述，例如调用什么接口" />
      </EditorFormItem>
    </>
  );
});
