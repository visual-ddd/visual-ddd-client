import classNames from 'classnames';
import s from './SidebarFolder.module.scss';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

export interface SidebarFolderProps {
  placement?: 'left' | 'right';
  folded?: boolean;
  onFoldedChange?: (folded: boolean) => void;
}

function reverseDirection(direction: 'left' | 'right') {
  return direction === 'left' ? 'right' : 'left';
}

export const SidebarFolder = (props: SidebarFolderProps) => {
  const { placement = 'left', folded, onFoldedChange } = props;

  const arrowDirection = folded ? reverseDirection(placement) : placement;

  const handleFoldedChange = () => {
    onFoldedChange?.(!folded);
  };

  return (
    <div className={classNames(s.root, placement)} onClick={handleFoldedChange} title="折叠面板">
      {arrowDirection === 'left' ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
    </div>
  );
};
