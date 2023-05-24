import { CodeSandboxOutlined } from '@ant-design/icons';
import { registerBlock } from '../ReactBlock';
import { ThirdPartyBlock, ThirdPartyBlockState } from './ThirdPartyBlock';

registerBlock<ThirdPartyBlockState>({
  name: 'codesandbox',
  title: 'CodeSandbox',
  icon: CodeSandboxOutlined,
  initialState: () => ({ url: '', height: 500 }),
  render({ state, updateState, selected }) {
    const handleChange = (value: string) => {
      try {
        const url = new URL(value);

        if (!url.pathname.startsWith('/embed/')) {
          throw TypeError('地址错误');
        }

        updateState({ url: value });
      } catch (error) {
        throw new Error('请输入正确的 Codesandbox 仓库地址, 例如 https://codesandbox.io/embed/react-new ');
      }
    };

    return (
      <ThirdPartyBlock
        placeholder="输入 Codesandbox 仓库地址"
        exampleValue="https://codesandbox.io/embed/react-new?fontsize=14&hidenavigation=1&theme=dark"
        value={state.url}
        height={state.height}
        onHeightChange={height => updateState({ height })}
        onChange={handleChange}
        selected={selected}
      ></ThirdPartyBlock>
    );
  },
});
