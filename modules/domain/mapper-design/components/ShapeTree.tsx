import { Empty, Tree, TreeDataNode } from 'antd';
import classNames from 'classnames';
import { Observer, observer, useLocalObservable } from 'mobx-react';
import { EditorPanel, useCanvasModel, useEditorModel } from '@/lib/editor';
import s from '@/modules/domain/domain-design/components/ShapeTree/index.module.scss';

import { Mapper, MapperEditorModel } from '../model';
import { NoopArray } from '@wakeapp/utils';

export interface ShapeTreeProps {}

const renderTitle = (item: Mapper) => {
  return (
    <Observer>
      {() => (
        <div className={classNames('vd-shape-tree-item', s.item)}>
          <div className={classNames('vd-shape-tree-item__body', s.itemBody)}>
            <span>{item.readableTitle}</span>
          </div>
        </div>
      )}
    </Observer>
  );
};

export const ShapeTree = observer(function ShapeTree(props: ShapeTreeProps) {
  const { model } = useEditorModel<MapperEditorModel>();
  const { model: canvasModel } = useCanvasModel();

  const store = useLocalObservable(() => ({
    get treeData(): TreeDataNode[] {
      return model.mapperStore.mappersInArray.map(i => {
        return {
          key: i.id,
          title: () => renderTitle(i),
        };
      });
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
      <div className={classNames('vd-shape-tree__body', s.body)}>
        {!store.treeData.length ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="拖拽组件到画布试试"></Empty>
        ) : (
          <Tree
            treeData={store.treeData}
            virtual={false}
            blockNode
            selectedKeys={store.selected}
            // @ts-expect-error
            onSelect={store.handleSelect}
          ></Tree>
        )}
      </div>
    </EditorPanel>
  );
});
