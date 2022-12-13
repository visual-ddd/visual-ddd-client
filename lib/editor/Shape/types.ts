import React from 'react';
import { Node, Graph, Size, PointLike } from '@antv/x6';
import { BaseEditorStore, BaseNode, Properties } from '../Model';

export interface ShapeCoreInfo {
  type: string;
}

export interface ShapeConfiguration {
  /**
   * 是否为群组，默认为 false
   */
  group?: boolean;

  /**
   * 是否支持内嵌节点
   * @note 只有 group 开启后有效, group 开启后，默认为 true
   */
  embeddable?:
    | boolean
    | ((context: { model: BaseNode; childModel?: BaseNode; node: Node; child: Node; graph: Graph }) => boolean);

  /**
   * 是否允许组件库拖入作为子节点
   *
   * 这个和 embeddable 类似，只不过这里验证的是从组件库拖入的。当 group 开启后，这两个参数都需要定义
   *
   * @note 只有 group 开启后有效, group 开启后，默认为 true
   */
  droppable?: boolean | ((context: { graph: Graph; model: BaseNode; node: Node; sourceType: string }) => boolean);

  /**
   * 拖入时数据初始化, 默认只会创建包含 position 的基础数据
   * @returns
   */
  dropFactory?: (context: { nativeEvent: React.DragEvent; graph: Graph }) => Properties;

  /**
   * 组件渲染定义
   */
  component: (props: {
    cellProps: {
      position?: PointLike;
      size?: Size;
      attrs?: Record<string, any>;
      zIndex?: number;
      id: string;
      data: Properties;
      children?: React.ReactNode;
      canBeParent?: boolean;
    };
    store: BaseEditorStore;
    model: BaseNode;
  }) => React.ReactElement;
}
