import React from 'react';
import { Node, Graph, Size, PointLike, Cell, Edge } from '@antv/x6';
import { Transform } from '@antv/x6-plugin-transform';

import { BaseEditorModel, BaseNode, Properties, ShapeType } from '../Model';
import { CopyPayload } from '../Canvas/ClipboardUtils';
import { FormModel, FormRules } from '../Model/FormModel';
import { StaticImageData } from 'next/image';

export interface ShapeCoreInfo {
  type: string;
}

export interface ShapeComponentCellProps {
  id: string;
  data: Properties;
  children?: React.ReactNode;
  canBeParent?: boolean;

  // 以下属性如果在 Properties 定义了，会自动展开到这里

  // Cell 节点包含一下属性
  zIndex?: number;
  visible?: boolean;

  // Node 节点包含以下 属性
  position?: PointLike;
  size?: Size;
  angle?: number;

  // Edge 节点包含以下属性
  source?: Edge.TerminalData;
  target?: Edge.TerminalData;
}

export type ShapeResizingOptions = Omit<Transform.ResizingRaw, 'enabled'>;

export interface ShapeComponentProps {
  cellProps: ShapeComponentCellProps;
  model: BaseEditorModel;
  node: BaseNode;
}

export interface ShapeAttributesComponentProps {
  model: BaseEditorModel;
  node: BaseNode;
  formModel: FormModel;
}

export interface NormalizedAutoResizeGroup {
  padding: number;
  minWidth: number;
  minHeight: number;
}

export interface ShapeConfiguration {
  /**
   * 图形名称，需要全局唯一
   */
  name: string;

  /**
   * 标题
   */
  title: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 图标 URL
   */
  icon?: string | StaticImageData;

  /**
   * 组件的类型
   */
  shapeType: ShapeType;

  /**
   * 验证规则
   */
  rules?: FormRules;

  /**
   * 是否支持尺寸调整, 默认 false
   * 仅 node 类型支持
   * @note 仅 Node 支持
   */
  resizing?: boolean | ShapeResizingOptions | ((context: { node: Node; graph: Graph }) => ShapeResizingOptions);

  /**
   * 是否支持交互式修改节点旋转角度，默认 false
   * 如果传入 number，则是设置 grid
   * @note 仅 Node 支持
   */
  rotating?: boolean | number;

  /**
   * 是否为群组，默认为 false
   * @note 仅 Node 支持
   */
  group?: boolean;

  /**
   * 是否在子节点变动时自动调整分组的大小, 默认为 false
   *
   * 如果设置为 number, 则为分组的 padding, 默认 padding 为 30
   *
   * @note 只有在 group 开始后有效
   */
  autoResizeGroup?: boolean | number | Partial<NormalizedAutoResizeGroup>;

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
   * TODO: 支持 edge 类型拖入
   * 拖入时数据初始化, 默认只会创建包含 position 的基础数据
   * @note 注意，放在 Properties 的表示会进行持久化, 对于不需要持久化的静态数据，比如 attrs 等，
   *   在 component 渲染时、或 initialProps 中指定
   * @returns
   */
  dropFactory?: (context: { nativeEvent: React.DragEvent; graph: Graph }) => Properties;

  /**
   * 粘贴时数据初始化
   * @param context
   * @returns
   */
  copyFactory?: (context: { properties: Properties; payload: CopyPayload }) => Properties;

  /**
   * 边创建工厂
   *
   * 当边从当前节点创建时，会触发该事件, 用户可以直接由哪个类型来创建边, 默认为 edge
   */
  edgeFactory?: string | ((context: { graph: Graph; cell: Cell; model: BaseNode; magnet: Element }) => string);

  /**
   * 静态的、初始参数
   * @returns
   */
  staticProps?: () => Record<string, any>;

  /**
   * 初始状态，这里指定的状态会放置到 Model 进行持久化
   * 而 staticProps 是静态的，只在组件渲染时有用
   * 这些参数可以在 component 中通过 model.properties 获取
   *
   * 另外在 copyFactory、dropFactory 中也可以定义参数，这些工厂定义的参数优先级高于 initialProps
   *
   * @returns
   */
  initialProps?: () => Properties;

  /**
   * 是否支持选中, 默认 true
   */
  selectable?: boolean;

  /**
   * 是否支持删除, 默认 true
   */
  removable?: boolean | ((context: { model: BaseNode; graph: Graph }) => boolean);

  /**
   * 是否支持移动, 默认 true
   */
  movable?: boolean | ((context: { model: BaseNode; graph: Graph }) => boolean);

  /**
   * 是否允许循环连线, 默认为 true
   */
  allowLoopConnect?: boolean;

  /**
   * 允许连接到的 shape 类型，默认为 true, 即所有节点
   */
  allowConnectNodes?:
    | boolean
    | string[]
    | ((context: {
        sourceModel: BaseNode;
        sourceCell: Cell;
        sourcePort?: string;
        targetModel: BaseNode;
        targetCell: Cell;
        targetPort?: string;
        graph: Graph;
      }) => boolean);

  /**
   * 组件渲染定义
   */
  component: React.ComponentType<ShapeComponentProps>;

  /**
   * 属性编辑器渲染
   */
  attributeComponent?: React.ComponentType<ShapeAttributesComponentProps>;
}
