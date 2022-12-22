import { useMemo } from 'react';
import { DragHandle, SortableList } from '@/lib/components';
import { useEditorFormContext } from '@/lib/editor';
import { Button } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { EditTwoTone, MinusCircleTwoTone } from '@ant-design/icons';

import { PropertyDSL, VoidClass, UntitledInCamelCase, AccessModifier, createProperty } from '../../../dsl';
import s from './index.module.scss';
import { PropertyEditor, usePropertyEditorRef } from './PropertyEditor';

export interface PropertiesEditorProps {}

// SWC 在 handleRemove 那里转换有bug
const _createProperty = createProperty;

interface ItemContext {
  handleEdit: (item: PropertyDSL) => void;
  handleRemove: (idx: number) => void;
}

const Item = observer(function Item(props: { value: PropertyDSL; context: ItemContext; index: number }) {
  const { value, context, index } = props;
  const { access = 'public', type = VoidClass, title, name = UntitledInCamelCase } = value;

  return (
    <div className={classNames('vd-properties-editor-item', s.item)}>
      <DragHandle className={classNames('vd-properties-editor-item__handle', s.itemHandle)} />
      <div className={classNames('vd-properties-editor-item__content', s.itemContent)}>
        <span className={classNames('vd-properties-editor-item__access', s.itemAccess)}>{AccessModifier[access]}</span>
        <span className={classNames('vd-properties-editor-item__name', s.itemName)} title={title}>
          <span className="u-bold">{name}</span>: {type}
        </span>
      </div>
      <div className={classNames('vd-properties-editor-item__actions', s.itemActions)}>
        <EditTwoTone
          onClick={() => {
            context.handleEdit(value);
          }}
        />
        <MinusCircleTwoTone
          onClick={() => {
            context.handleRemove(index);
          }}
        />
      </div>
    </div>
  );
});

/**
 * 属性编辑器
 */
export const PropertiesEditor = observer(function PropertiesEditor(props: PropertiesEditorProps) {
  const { formModel } = useEditorFormContext()!;
  const getProperties = () => formModel.getProperty('properties') as PropertyDSL[];
  const properties = getProperties();
  const propertyEditorRef = usePropertyEditorRef<PropertyDSL>();

  const context = useMemo(() => {
    return {
      handleEdit(item) {
        propertyEditorRef.current?.show(item);
      },
      handleRemove(idx) {
        const clone = getProperties().slice();
        clone.splice(idx, 1);

        formModel.setProperty('properties', clone);
      },
      // @ts-expect-error
      handleAdd() {
        const property = _createProperty();

        const clone = getProperties().slice();
        property.name += clone.length;

        clone.push(property);
        formModel.setProperty('properties', clone);

        requestAnimationFrame(() => {
          propertyEditorRef.current?.show(property);
        });
      },
      handleSorted(list: PropertyDSL[]) {
        formModel.setProperty('properties', list);
      },
    } satisfies ItemContext;
  }, [formModel]);

  return (
    <div className={classNames('vd-properties-editor', s.root)}>
      <SortableList
        value={properties}
        onChange={context.handleSorted}
        id="uuid"
        Item={Item}
        context={context}
      ></SortableList>
      <Button className={classNames('vd-properties-editor__add', s.add)} onClick={context.handleAdd}>
        添加属性
      </Button>
      <PropertyEditor list={properties} path="properties" ref={propertyEditorRef} />
    </div>
  );
});
