import { EditorNodeVisibleControl, EditorPanel, useCanvasModel, useEditorModel } from '@/lib/editor';
import { NoopArray } from '@wakeapp/utils';
import { Empty, Tree, TreeDataNode } from 'antd';
import classNames from 'classnames';
import { Observer, observer, useLocalObservable } from 'mobx-react';

import { NameDSL } from '../../dsl';
import { DomainEditorModel, DomainObject, DomainObjectFactory } from '../../model';

import s from './index.module.scss';

export interface ShapeTreeProps {}

const renderTitle = (item: DomainObject<NameDSL>) => {
  return (
    <Observer>
      {() => (
        <div className={classNames('vd-shape-tree-item', s.item)}>
          <div className={classNames('vd-shape-tree-item__body', s.itemBody)}>
            <span className={classNames('vd-shape-tree-item__type', s.itemType)}>{item.objectTypeTitle}-</span>
            <span>{item.readableTitle}</span>
          </div>
          <div className={classNames('vd-shape-tree-item__extra', s.itemExtra)}>
            {DomainObjectFactory.isAggregation(item) && <EditorNodeVisibleControl node={item.id} includeChildren />}
          </div>
        </div>
      )}
    </Observer>
  );
};

const VIRTUAL_UNCONTROLLED_NODES = '__UNCONTROLLED_NODES__';

export const ShapeTree = observer(function ShapeTree(props: ShapeTreeProps) {
  const { model } = useEditorModel<DomainEditorModel>();
  const { model: canvasModel } = useCanvasModel();

  const store = useLocalObservable(() => ({
    get uncontrolled(): TreeDataNode | undefined {
      const uncontrolledDomainObjects = model.domainObjectStore.uncontrolledDomainObjects;
      if (uncontrolledDomainObjects.length) {
        return {
          key: VIRTUAL_UNCONTROLLED_NODES,
          title: '未关联聚合',
          selectable: false,
          children: uncontrolledDomainObjects.map(i => {
            return {
              key: i.id,
              title: () => renderTitle(i),
            };
          }),
        };
      }
    },
    get aggregations(): TreeDataNode[] {
      return model.domainObjectStore.aggregations.map(i => {
        return {
          key: i.id,
          title: () => renderTitle(i),
          children: i.compositions.concat(i.aggregations).map(j => {
            return {
              key: j.id,
              title: () => renderTitle(j),
            };
          }),
        };
      });
    },
    get queries(): TreeDataNode | undefined {
      if (!model.domainObjectStore.queries.length) {
        return;
      }

      return {
        key: 'QUERY',
        title: '查询',
        selectable: false,
        children: model.domainObjectStore.queries.map(i => {
          return {
            key: i.id,
            title: () => renderTitle(i),
          };
        }),
      };
    },
    get dtos(): TreeDataNode | undefined {
      if (!model.domainObjectStore.dtos.length) {
        return;
      }

      return {
        key: 'DTO',
        title: 'DTO',
        selectable: false,
        children: model.domainObjectStore.dtos.map(i => {
          return {
            key: i.id,
            title: () => renderTitle(i),
          };
        }),
      };
    },
    get treeData(): TreeDataNode[] {
      const nodes = [];
      if (this.uncontrolled) {
        nodes.push(this.uncontrolled);
      }

      if (this.aggregations.length) {
        nodes.push(...this.aggregations);
      }

      if (this.queries) {
        nodes.push(this.queries);
      }

      if (this.dtos) {
        nodes.push(this.dtos);
      }

      return nodes;
    },
    get selected(): string[] {
      const focusing = model.viewStore.focusingNode;
      return focusing ? [focusing.id] : NoopArray;
    },
    handleSelect(selected: string[]) {
      canvasModel.handleSelect({ cellIds: selected });
    },
  }));

  return (
    <EditorPanel title="组件树" className={classNames('vd-shape-tree', s.root)}>
      {!store.treeData.length ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="拖拽组件到画布里面试试" />
      ) : (
        <Tree
          treeData={store.treeData}
          defaultExpandAll
          virtual={false}
          blockNode
          selectedKeys={store.selected}
          // 点击直接是多选的, 操作有点怪，先禁用
          // multiple

          // @ts-expect-error
          onSelect={store.handleSelect}
        ></Tree>
      )}
    </EditorPanel>
  );
});
