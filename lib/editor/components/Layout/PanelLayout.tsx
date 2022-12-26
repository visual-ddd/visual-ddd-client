import { FC } from 'react';
import { SplitBox } from '@antv/x6-react-components';

export interface EditorPanelLayoutProps {
  children: React.ReactElement;

  /**
   * 底部内容
   */
  bottom?: React.ReactNode;
}

export const EditorPanelLayout: FC<EditorPanelLayoutProps> = props => {
  const { children, bottom } = props;
  if (bottom == null) {
    return children;
  }

  return (
    <SplitBox split="horizontal" defaultSize="40%" minSize={37} maxSize={500}>
      {children}
      {bottom}
    </SplitBox>
  );
};
