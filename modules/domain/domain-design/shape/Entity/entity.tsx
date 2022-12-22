import {
  defineShape,
  EditorFormCollapse,
  EditorFormCollapsePanel,
  EditorFormItem,
  ShapeComponentProps,
} from '@/lib/editor';
import { ReactComponentBinding, registerReactComponent } from '@/lib/g6-binding';
import { Input } from 'antd';

import { createEntity, MethodsEditor, PropertiesEditor } from '../../dsl';

import { EntityReactShapeComponent } from './ReactShapeComponent';
import icon from './entity.png';

registerReactComponent('entity', EntityReactShapeComponent);

export const EntityShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component="entity" />;
};

const DEFAULT_ACTIVE = ['base', 'properties', 'methods'];
export const EntityShapeAttributeComponent = () => {
  return (
    <EditorFormCollapse defaultActiveKey={DEFAULT_ACTIVE}>
      <EditorFormCollapsePanel header="基础信息" key="base">
        <EditorFormItem path="name" label="标识符" tooltip="合法的 Java 大写驼峰式的标识符">
          <Input placeholder="标识符, 大写驼峰式" />
        </EditorFormItem>
        <EditorFormItem path="title" label="标题">
          <Input placeholder="使用统一语言起个标题" />
        </EditorFormItem>
        <EditorFormItem path="description" label="描述">
          <Input.TextArea placeholder="写点注释吧" />
        </EditorFormItem>
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="属性" key="properties">
        <PropertiesEditor />
      </EditorFormCollapsePanel>
      <EditorFormCollapsePanel header="方法" key="methods">
        <MethodsEditor />
      </EditorFormCollapsePanel>
    </EditorFormCollapse>
  );
};

/**
 * 实体
 */
defineShape({
  name: 'entity',
  title: '实体',
  description: '领域实体',
  icon: icon,
  shapeType: 'node',

  initialProps: () => {
    return createEntity();
  },
  component: EntityShapeComponent,
  attributeComponent: EntityShapeAttributeComponent,
});
