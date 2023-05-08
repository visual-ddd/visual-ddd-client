import { NamedRegistry } from '@wakeapp/utils';

export interface ReactBlockComponent<State extends {}> {
  /**
   * 块名
   */
  name: string;

  /**
   * 图标
   */
  icon?: React.ComponentType;

  /**
   * 描述
   */
  title: string;

  /**
   * 初始状态
   */
  initialState: () => State;

  /**
   * 渲染函数
   * @param state
   * @param updateState
   * @returns
   */
  render: (state: State, updateState: (state: Partial<State>) => void) => JSX.Element;
}

export const ReactBlockRegistry = new NamedRegistry<ReactBlockComponent<any>>();

export function registerBlock<T extends {}>(block: ReactBlockComponent<T>) {
  return ReactBlockRegistry.register(block.name, block);
}
