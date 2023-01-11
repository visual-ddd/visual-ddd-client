import { Edge } from '@antv/x6';
import { useEditorModel } from '@/lib/editor';
import { EdgeBinding } from '@/lib/g6-binding';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { DataObjectEdgeDeclaration, DataObjectEditorModel } from '../model';
import { DataObjectReferenceCardinality } from '../dsl';

const Connector: Edge.BaseOptions['connector'] = { name: 'rounded' };
const Router: Edge.BaseOptions['router'] = { name: 'er' };
const marker = {
  name: 'path',
  d: 'M 25.8 11.6 C 17.5 13.3 14.6 14.9 7.1 17.9 M 25.8 11.6 L 7 11.6 M 25.8 11.6 C 17.2 9.6 14.5 8 7 5.6',
  offsetX: -7,
  offsetY: -0.4,
  strokeWidth: 2,
};
const Attrs: Edge.BaseOptions['attrs'] = {
  line: {
    strokeWidth: 2,
    stroke: '#188fff',
    // sourceMarker: null,
    // targetMarker: null,
    sourceMarker: {
      name: 'path',
      d: '',
      strokeWidth: 0,
    },
    targetMarker: {
      name: 'path',
      d: '',
      strokeWidth: 0,
    },
  },
};

const DataObjectEdge = observer(function DataObjectEdge(props: { edge: DataObjectEdgeDeclaration }) {
  const { id, target, source, type } = props.edge;

  const attrs = useMemo(() => {
    if (type == null) {
      return { ...Attrs };
    }

    switch (type) {
      case DataObjectReferenceCardinality.OneToOne:
        return { ...Attrs };
      case DataObjectReferenceCardinality.OneToMany:
        return {
          ...Attrs,
          line: {
            ...Attrs.line,
            targetMarker: marker,
          },
        };
      case DataObjectReferenceCardinality.ManyToOne:
        return {
          ...Attrs,
          line: {
            ...Attrs.line,
            sourceMarker: marker,
          },
        };
      case DataObjectReferenceCardinality.ManyToMany: {
        return {
          ...Attrs,
          line: {
            ...Attrs.line,
            sourceMarker: marker,
            targetMarker: marker,
          },
        };
      }
    }
  }, [type]);

  return (
    <EdgeBinding
      id={id}
      target={target}
      source={source}
      connector={Connector}
      router={Router}
      attrs={attrs}
    ></EdgeBinding>
  );
});

/**
 * 数据对象之间的关联边
 */
export const DomainObjectReferenceEdges = observer(function DomainObjectReferenceEdges() {
  const { model } = useEditorModel<DataObjectEditorModel>();

  if (!model.dataObjectStore.edges.length) {
    return null;
  }

  return (
    <>
      {model.dataObjectStore.edges.map(edge => {
        return <DataObjectEdge key={edge.id} edge={edge}></DataObjectEdge>;
      })}
    </>
  );
});
