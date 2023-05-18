import { registerBlock } from '../ReactBlock';
import { ThirdPartyBlock, ThirdPartyBlockState } from './ThirdPartyBlock';
import { ProcessOnIcon } from './ProcessOnIcon';

registerBlock<ThirdPartyBlockState>({
  name: 'processon',
  title: 'ProcessOn',
  icon: ProcessOnIcon,
  initialState: () => ({ url: '', height: 500 }),
  render({ state, updateState, selected }) {
    const handleChange = (value: string) => {
      try {
        const url = new URL(value);

        if (!url.host.includes('processon.com') || !url.pathname.startsWith('/embed/')) {
          throw TypeError('地址错误');
        }

        updateState({ url: value });
      } catch (error) {
        throw new Error('请输入正确的 ProcessOn 地址, 例如 https://www.processon.com/embed/64599fcec9b6e303a6d2bccb ');
      }
    };

    return (
      <ThirdPartyBlock
        placeholder="输入 ProcessOn 链接(分享协作 > 嵌入第三方 > 复制链接)"
        exampleValue="https://www.processon.com/embed/64599fcec9b6e303a6d2bccb"
        value={state.url}
        height={state.height}
        onHeightChange={height => updateState({ height })}
        onChange={handleChange}
        selected={selected}
      ></ThirdPartyBlock>
    );
  },
});
