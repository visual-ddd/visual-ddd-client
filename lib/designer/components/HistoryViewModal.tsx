import { Modal } from 'antd';
import { HistoryView } from './HistoryView';
import { cloneElement, isValidElement, useState } from 'react';

export interface HistoryViewModalProps {
  children?: React.ReactNode;
}

export const HistoryViewModal = (props: HistoryViewModalProps) => {
  const { children } = props;
  const [visible, setVisible] = useState(false);

  const content = isValidElement(children)
    ? cloneElement(children, {
        // @ts-expect-error
        onClick: () => setVisible(true),
      })
    : children;

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Modal open={visible} onCancel={handleCancel} footer={null} title="历史记录(试验)" destroyOnClose width="80%">
        <HistoryView onReverse={handleCancel} />
      </Modal>
      {content}
    </>
  );
};
