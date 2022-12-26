import { useEditorModel } from '@/lib/editor';
import { EdgeBinding, EdgeBindingProps } from '@/lib/g6-binding';
import { observer } from 'mobx-react';
import { memo, useMemo } from 'react';
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
      stroke: '#8080809e',
    },
  },
});

const AssociationEdge = createEdge('AssociationEdge', {
  connector: Connector,
  attrs: {
    line: {
      strokeWidth: 1,
      stroke: '#808080cf',
    },
  },
});

const AggregationEdge = createEdge('AggregationEdge', {
  connector: Connector,
  attrs: {
    line: {
      strokeWidth: 1,
      stroke: '#8080809e',
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
    return {
      line: {
        strokeWidth: 1,
        stroke: color,
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

export const DomainObjectReferenceEdges = observer(function DomainObjectReferenceEdges() {
  const { model } = useEditorModel<DomainEditorModel>();

  if (!model.domainObjectStore.edges.length) {
    return null;
  }

  return (
    <>
      {model.domainObjectStore.edges.map(i => {
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
