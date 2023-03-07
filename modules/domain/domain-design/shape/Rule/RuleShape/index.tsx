import classNames from 'classnames';
import { observer } from 'mobx-react';

import { UntitledInHumanReadable, UntitledInUpperCamelCase } from '../../../dsl/constants';
import { RuleDSL } from '../../../dsl/dsl';

import s from './index.module.scss';

export interface RuleShapeProps {
  dsl: RuleDSL;
  style?: React.CSSProperties;
  className?: string;
}

export const RuleShape = observer(function RuleShape(props: RuleShapeProps) {
  const { dsl, className, style } = props;
  return (
    <div className={classNames('vd-shape-rule', s.root, className)} style={style}>
      <div className={classNames('vd-shape-rule__type', s.type)}>《规则》</div>
      <div className={classNames('vd-shape-rule__name', s.name)}>
        {dsl.title || UntitledInHumanReadable}({dsl.name || UntitledInUpperCamelCase})
      </div>
      <div className={classNames('vd-shape-rule__desc', s.desc)}>{dsl.description || '内容为空'}</div>
    </div>
  );
});
