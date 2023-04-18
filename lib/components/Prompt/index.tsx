import { Input, Modal } from 'antd';
import { action, observable } from 'mobx';
import { Observer } from 'mobx-react';

import s from './index.module.scss';

const AUTO_SIZE = {
  minRows: 4,
  maxRows: 10,
};

export function usePrompt() {
  const [modal, holder] = Modal.useModal();

  const show = (options: { title: React.ReactNode; value: string; placeholder: string; maxLength?: number }) => {
    const state = observable({ value: options.value || '' });
    const setValue = action((value: string) => {
      state.value = value;
    });

    return new Promise<string | undefined>(resolve => {
      modal.info({
        className: s.root,
        title: options.title,
        content: (
          <div className={s.body}>
            <Observer>
              {() => {
                return (
                  <Input.TextArea
                    value={state.value}
                    onChange={e => setValue(e.target.value)}
                    maxLength={options.maxLength}
                    showCount
                    autoFocus
                    autoSize={AUTO_SIZE}
                    placeholder={options.placeholder}
                  />
                );
              }}
            </Observer>
          </div>
        ),
        maskClosable: false,
        keyboard: false,
        closable: true,
        okText: '确定',
        onOk: () => {
          resolve(state.value);
        },
        onCancel: () => resolve(undefined),
      });
    });
  };

  return [show, holder] as [typeof show, typeof holder];
}
