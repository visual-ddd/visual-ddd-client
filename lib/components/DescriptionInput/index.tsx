import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input/TextArea';

export interface DescriptionInputProps extends TextAreaProps {}

const AUTO_SIZE = { minRows: 3, maxRows: 8 };

export const DescriptionInput = (props: DescriptionInputProps) => {
  return <Input.TextArea placeholder="写点注释吧" autoSize={AUTO_SIZE} {...props} />;
};
