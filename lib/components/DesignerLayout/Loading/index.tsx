import { Spin } from 'antd';

import s from './index.module.scss';

export interface DesignerLoadingProps {
  loading?: boolean;
}

export const DesignerLoading = (props: DesignerLoadingProps) => {
  const { loading } = props;

  if (!loading) {
    return null;
  }

  return (
    <div className={s.mask}>
      <div className={s.root}>
        <Spin tip="设计器加载中"></Spin>
      </div>
    </div>
  );
};
