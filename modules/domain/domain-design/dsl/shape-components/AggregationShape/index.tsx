import classNames from 'classnames';
import { observer } from 'mobx-react';

import { UntitledInHumanReadable, UntitledInUpperCamelCase } from '../../constants';
import { AggregationDSL } from '../../dsl';

import s from './index.module.scss';

export interface AggregationShapeProps {
  dsl: AggregationDSL;
  style?: React.CSSProperties;
  className?: string;
}

export const AggregationShape = observer(function AggregationShape(props: AggregationShapeProps) {
  const { dsl } = props;
  return (
    <div
      className={classNames('vd-aggregation-shape', s.root)}
      style={{
        // @ts-expect-error
        '--color': dsl.color,
      }}
    >
      <div className={classNames('vd-aggregation-shape__header', s.header)}>
        <div className={classNames('vd-aggregation-shape__type', s.type)}>《聚合》</div>
        <div className={classNames('vd-aggregation-shape__name', s.name)}>
          {dsl.title || UntitledInHumanReadable}({dsl.name || UntitledInUpperCamelCase})
        </div>
      </div>
    </div>
  );
});
