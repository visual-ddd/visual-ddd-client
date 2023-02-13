import { InboxOutlined } from '@ant-design/icons';
import { delay } from '@wakeapp/utils';
import { Modal, Upload, UploadProps, message as Message } from 'antd';
import classNames from 'classnames';
import { cloneElement, isValidElement, useState } from 'react';
import s from './index.module.scss';

export interface ImportProps extends Pick<UploadProps, 'beforeUpload' | 'accept'> {
  children?: React.ReactNode;
  title?: React.ReactNode;
  message?: React.ReactNode;
  template: string;
  onUpload: (options: { file: File }) => Promise<void>;
}

/**
 * 文件导入
 */
export const Import = (props: ImportProps) => {
  const { title = '文件导入', message, template, accept = '.xlsx,.xls', beforeUpload, onUpload, children } = props;
  const [visible, setVisible] = useState(false);

  const handleCancel = () => {
    setVisible(false);
  };

  const customRequest: UploadProps['customRequest'] = async options => {
    try {
      await onUpload({ file: options.file as File });
      options.onSuccess?.(undefined);
      Message.success('导入成功');
      await delay(1000);
      setVisible(false);
    } catch (err) {
      options.onError?.(err as Error);
    }
  };

  const trigger = isValidElement(children)
    ? cloneElement(children, {
        onClick: () => setVisible(true),
      } as any)
    : undefined;

  return (
    <>
      {trigger}
      <Modal
        className={classNames('vd-import', s.root)}
        title={title}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Upload.Dragger
          withCredentials
          maxCount={1}
          accept={accept}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
        >
          <div className={classNames('vd-import__icon', s.icon)}>
            <InboxOutlined />
          </div>
          <div className={classNames('vd-import__text')}>
            点击或者拖拽文件到这里。点击这里
            <a className="u-link" href={template}>
              下载模板
            </a>
          </div>
          <p className="vd-import__message">{message || '仅支持单文件上传'}</p>
        </Upload.Dragger>
      </Modal>
    </>
  );
};
