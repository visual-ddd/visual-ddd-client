import { Input, InputProps } from 'antd';

// TODO: 支持统一语言推断
export interface TitleInputProps extends InputProps {}

export const TitleInput = (props: TitleInputProps) => {
  return <Input placeholder="使用统一语言(业务术语)起个标题" {...props} />;
};
