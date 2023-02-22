import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input/TextArea';

export interface DescriptionInputProps extends TextAreaProps {}

export const DescriptionInput = (props: DescriptionInputProps) => {
  return <Input.TextArea placeholder="写点注释吧" {...props} />;
};
