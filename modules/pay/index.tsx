import { Modal } from 'antd';
import Image from 'next/image';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import s from './Pay.module.scss';
import QRCode from './qrcode.png';

export interface IPayProps {
  OnPaySuccess?: () => void;

  OnPayError?: (err: any) => void;
}

export interface IPayModalRef {
  open: () => void;
  close: () => void;
}

export function usePayModalRef() {
  return useRef<IPayModalRef>(null);
}
export const PayModal = forwardRef<IPayModalRef, IPayProps>((props, ref) => {
  const [visible, setVisible] = useState(false);

  const handleCancel = () => {
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    open() {
      setVisible(true);
    },
    close() {
      handleCancel();
    },
  }));

  return (
    <Modal open={visible} footer={null} onCancel={handleCancel} centered width={300} title="充值" destroyOnClose>
      {/* <Pay {...props}></Pay> */}
      <picture className={s.picture}>
        <Image src={QRCode} className={s.img} alt="qrcode" />
      </picture>
      <div className={s.desc}> 请扫码添加管理员进行充值 </div>
    </Modal>
  );
});

PayModal.displayName = 'PayModal';
