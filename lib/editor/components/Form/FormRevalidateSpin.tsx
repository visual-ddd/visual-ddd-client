import { SyncOutlined } from '@ant-design/icons';
import { delay } from '@wakeapp/utils';
import { Tooltip } from 'antd';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { useEditorFormContext } from './FormContext';

import s from './FormRevalidateSpin.module.scss';

export interface EditorFormRevalidateSpinProps {
  path?: string;
}

export const EditorFormRevalidateSpin = observer(function EditorFormRevalidateSpin(
  props: EditorFormRevalidateSpinProps
) {
  const { path } = props;
  const [loading, setLoading] = useState(false);
  const { formModel, readonly } = useEditorFormContext()!;

  const handleRevalidate = async (evt: React.MouseEvent) => {
    evt.stopPropagation();

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      formModel.validateFieldRecursive(path!);

      await delay(1400);
    } finally {
      setLoading(false);
    }
  };

  if (path == null || readonly) {
    return null;
  }

  return (
    <Tooltip title="重新验证">
      <SyncOutlined className={s.root} spin={loading} onClick={handleRevalidate} />
    </Tooltip>
  );
});
