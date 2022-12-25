import { defineShape, ShapeComponentProps, useShapeModel } from '@/lib/editor';
import { ReactComponentBinding, ReactComponentProps, registerReactComponent } from '@/lib/g6-binding';
import { DomainObjectReferenceContextProvider } from '../../components';

import { ClassShape, createEntity, EntityEditor, EntityDSL, DomainObjectName } from '../../dsl';

import icon from './entity.png';

const EntityReactShapeComponent = (props: ReactComponentProps) => {
  const properties = useShapeModel(props.node).properties as unknown as EntityDSL;

  return <ClassShape dsl={properties} type="实体" style={{ backgroundColor: '#d9f7be' }} />;
};

registerReactComponent(DomainObjectName.Entity, EntityReactShapeComponent);

const EntityShapeComponent = (props: ShapeComponentProps) => {
  return <ReactComponentBinding {...props.cellProps} component={DomainObjectName.Entity} />;
};

const EntityAttributesComponent = () => {
  return (
    <DomainObjectReferenceContextProvider>
      <EntityEditor />
    </DomainObjectReferenceContextProvider>
  );
};

/**
 * 实体
 */
defineShape({
  name: DomainObjectName.Entity,
  title: '实体',
  description: '领域实体',
  icon: icon,
  shapeType: 'node',

  initialProps: () => {
    return { ...createEntity(), zIndex: 2 };
  },
  component: EntityShapeComponent,
  attributeComponent: EntityAttributesComponent,
});
