import { useEditorModel } from '@/lib/editor';
import { EdgeBinding, EdgeBindingProps } from '@/lib/g6-binding';
import { observer } from 'mobx-react';
import { memo, useMemo } from 'react';
import colorString from 'color-string';
import { NameDSL, RelationShipDSL } from '../dsl';
import { DomainEditorModel, DomainObject, DomainObjectAggregation, DomainObjectFactory } from '../model';

interface EdgeProps {
  source: DomainObject<NameDSL>;
  target: DomainObject<NameDSL>;
  id: string;
}

const createEdge = (name: string, bindingProps: EdgeBindingProps) => {
  /**
   * 依赖边
   */
  const CustomEdge = memo((props: EdgeProps) => {
    const { source, id, target } = props;

    return <EdgeBinding id={id} source={source.id} target={target.id} {...bindingProps}></EdgeBinding>;
  });

  CustomEdge.displayName = name;

  return CustomEdge;
};

const Connector = {
  name: 'smooth',
};

const DependencyEdge = createEdge('DependencyEdge', {
  connector: Connector,
  attrs: {
    line: {
      strokeWidth: 1,
      strokeDasharray: 4,
      stroke: '#8080804a',
    },
  },
});

const AssociationEdge = createEdge('AssociationEdge', {
  connector: Connector,
  attrs: {
    line: {
      strokeWidth: 1,
      stroke: '#8080804a',
    },
  },
});

const AggregationEdge = createEdge('AggregationEdge', {
  connector: Connector,
  attrs: {
    line: {
      strokeWidth: 1,
      stroke: '#8080804a',
      sourceMarker: {
        name: 'diamond',
        width: 18,
        height: 10,
        fill: '#ffffff',
      },
    },
  },
});

/**
 * 聚合的聚合关系边
 */
const AggregationAggregateEdge = observer(function AggregationAggregateEdge(props: EdgeProps) {
  const { source, id, target } = props;
  const color = (source as DomainObjectAggregation).color;
  const attrs = useMemo(() => {
    const rgb = colorString.get.rgb(color);
    rgb[3] = 0.8;

    const stroke = colorString.to.rgb(rgb);

    return {
      line: {
        strokeWidth: 1,
        stroke,
        sourceMarker: {
          name: 'diamond',
          width: 18,
          height: 10,
          fill: '#ffffff',
        },
      },
    };
  }, [color]);

  return <EdgeBinding id={id} source={source.id} target={target.id} attrs={attrs}></EdgeBinding>;
});

/**
 * 领域对象依赖关系渲染
 */
export const DomainObjectReferenceEdges = observer(function DomainObjectReferenceEdges() {
  const { model } = useEditorModel<DomainEditorModel>();

  if (!model.domainObjectStore.edges.length) {
    return null;
  }

  const visible = model.domainEditorViewModel.relationShipVisible;

  return (
    <>
      {model.domainObjectStore.edges
        .filter(i => {
          return visible.includes(i.type);
        })
        .map(i => {
          const EdgeType =
            i.type === RelationShipDSL.Dependency
              ? DependencyEdge
              : i.type === RelationShipDSL.Association
              ? AssociationEdge
              : i.type === RelationShipDSL.Aggregation
              ? DomainObjectFactory.isAggregation(i.sourceObject)
                ? AggregationAggregateEdge
                : AggregationEdge
              : null;

          if (EdgeType) {
            return <EdgeType key={i.id} id={i.id} source={i.sourceObject} target={i.targetObject} />;
          }

          return <EdgeBinding key={i.id} source={i.source} target={i.target}></EdgeBinding>;
        })}
    </>
  );
});
