import { Modal as Dialog } from 'antd';
import { cloneElement, isValidElement, useState } from 'react';

import { Prompt } from '../types';
import { List } from './List';

import s from './Modal.module.scss';

export interface ModalProps {
  children?: React.ReactNode;
  onImport?: (item: Prompt) => void;
}

export const Modal = function Modal(props: ModalProps) {
  const { children, onImport } = props;
  const [visible, setVisible] = useState(false);

  const handleImport = (item: Prompt) => {
    setVisible(false);
    onImport?.(item);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const child = isValidElement(children)
    ? cloneElement(children, {
        // @ts-expect-error
        onClick: () => {
          setVisible(true);
        },
      })
    : null;

  return (
    <>
      <Dialog className={s.root} open={visible} onCancel={handleCancel} footer={null} width="85%" centered>
        <List onImport={handleImport}></List>
      </Dialog>
      {child}
    </>
  );
};
