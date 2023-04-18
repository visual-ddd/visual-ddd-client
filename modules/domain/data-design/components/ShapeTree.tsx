import { Empty, Tree, TreeDataNode } from 'antd';
import classNames from 'classnames';
import { Observer, observer, useLocalObservable } from 'mobx-react';
import { EditorPanel, useCanvasModel, useEditorModel } from '@/lib/editor';
import s from '@/modules/domain/domain-design/components/ShapeTree/index.module.scss';

import { DataObject, DataObjectEditorModel } from '../model';
import { NoopArray } from '@wakeapp/utils';

export interface ShapeTreeProps {}

const renderTitle = (item: DataObject, handleContextMenu: (evt: React.MouseEvent<HTMLDivElement>) => void) => {
  return (
    <Observer>
      {() => (
        <div className={classNames('vd-shape-tree-item', s.item)} onContextMenu={handleContextMenu}>
          <div className={classNames('vd-shape-tree-item__body', s.itemBody)}>
            <span
              className={classNames('vd-shape-tree-item__type', s.itemType)}
              style={{
                // @ts-expect-error
                '--color': '#c7e0ff',
              }}
            >
              DO
            </span>
            <span className={classNames('vd-shape-tree-item__title', s.itemTitle)} title={item.readableTitle}>
              {item.readableTitle}
            </span>
          </div>
        </div>
      )}
    </Observer>
  );
};

export const ShapeTree = observer(function ShapeTree(props: ShapeTreeProps) {
  const { model } = useEditorModel<DataObjectEditorModel>();
  const { model: canvasModel } = useCanvasModel();

  const store = useLocalObservable(() => {
    const handleContextMenu = (item: DataObject) => (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      canvasModel.handleTriggerContextMenu({ node: item.node, event: e.nativeEvent });
    };

    return {
      get treeData(): TreeDataNode[] {
        return model.dataObjectStore.objectsInArray.map(i => {
          return {
            key: i.id,
            title: () => renderTitle(i, handleContextMenu(i)),
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
    };
  });

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
