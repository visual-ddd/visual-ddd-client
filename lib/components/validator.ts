import { valid, gt } from 'semver';
import { FormRule } from 'antd';

export const isValidVersion: FormRule = {
  async validator(_rule, value: string) {
    if (!value) {
      return;
    }

    if (!valid(value)) {
      throw new Error('版本号格式不正确，应为 major.minor.patch');
    }
  },
};

export const isGreaterThanVersion: (version: string) => FormRule = version => {
  return {
    async validator(_rule, value: string) {
      if (!value || !valid(value)) {
        return;
      }

      if (!gt(value, version)) {
        throw new Error(`版本号应大于 ${version}`);
      }
    },
  };
};
