import { ReactDecorator } from '@/lib/g6-binding';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Popover } from 'antd';
import classNames from 'classnames';
import { Observer } from 'mobx-react';
import { EditorFormIssues } from '../../components/Form/FormIssues';
import { useShapeModel } from '../hooks';

import s from './FormStatus.module.scss';

export const FormStatus: ReactDecorator = Input => {
  // eslint-disable-next-line react/display-name
  return props => {
    const { node } = props;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { formModel } = useShapeModel(node);

    return (
      <>
        <Observer>
          {() => {
            if (!formModel?.hasIssue) {
              return null;
            }

            return (
              <div className={classNames('vd-form-status-decorator', s.root, { error: formModel.hasError })}>
                <Popover
                  content={
                    <div>
                      <EditorFormIssues formModel={formModel} issues={formModel.errorInArray}></EditorFormIssues>
                    </div>
                  }
                  title="告警"
                  destroyTooltipOnHide
                  trigger="hover"
                >
                  <ExclamationCircleFilled />
                </Popover>
              </div>
            );
          }}
        </Observer>
        <Input {...props} />
      </>
    );
  };
};
