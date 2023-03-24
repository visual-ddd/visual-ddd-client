import { memo, useEffect, useMemo, useState } from 'react';
import { Checkbox, Collapse, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { PropertyDSL } from '@/modules/domain/api/dsl/interface';
import { EnterOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import { ObjectDSL, ObjectType } from './extra-api';

import s from './ObjectCard.module.scss';
import { TypeRender } from './TypeRender';

export interface ObjectCardProps {
  object: ObjectDSL;
  references: Record<string, ObjectDSL>;
}

const COLUMNS: ColumnType<PropertyDSL>[] = [
  { dataIndex: 'name', title: '属性名', width: 150 },

  {
    dataIndex: 'type',
    title: '类型',
    width: 120,
    render(type: PropertyDSL['type']) {
      return <TypeRender type={type}></TypeRender>;
    },
  },
  {
    title: '必需',
    dataIndex: 'optional',
    width: 80,
    align: 'center',
    render(value: boolean) {
      return <Checkbox checked={!value}></Checkbox>;
    },
  },
  {
    dataIndex: 'title',
    title: '标题',
  },
  {
    dataIndex: 'description',
    title: '描述',
  },
];

const PropertiesTable = (props: ObjectCardProps) => {
  const { object } = props;

  const columns = useMemo(() => {
    if (object.type === ObjectType.Enum) {
      const clone = COLUMNS.slice();
      const optionalIndex = clone.findIndex(i => i.dataIndex === 'optional');
      clone.splice(optionalIndex, 1);

      return clone;
    }

    return COLUMNS;
  }, [object.type]);

  return (
    <Table className={s.table} columns={columns} size="small" pagination={false} dataSource={object.properties}></Table>
  );
};

const OBJECT_TYPES: Record<ObjectType, [string, string]> = {
  [ObjectType.Command]: ['命令', '#FF5733'],
  [ObjectType.Query]: ['查询', '#1ABC9C'],
  [ObjectType.Enum]: ['枚举', '#6F2DA8'],
  [ObjectType.Object]: ['对象', '#4169E1'],
};

export const ObjectCard = memo((props: ObjectCardProps) => {
  const { object, references } = props;
  const [active, setActive] = useState(false);

  const notResult = object.result == null;
  const theme = OBJECT_TYPES[object.type];

  useEffect(() => {
    let listener = (evt: HashChangeEvent) => {
      const url = new URL(evt.newURL);

      if (url.hash === `#ref-${object.uuid}`) {
        setActive(true);
      }
    };

    window.addEventListener('hashchange', listener);

    return () => {
      window.removeEventListener('hashchange', listener);
    };
  }, [object.uuid]);

  return (
    <Collapse
      className={s.root}
      // @ts-expect-error
      style={{ '--color': theme[1] }}
      expandIconPosition="end"
      activeKey={active ? object.uuid : undefined}
      onChange={a => (a.length ? setActive(true) : setActive(false))}
      expandIcon={p => {
        return (
          <div className={classNames(s.expand, { active: p.isActive })}>
            <EnterOutlined />
          </div>
        );
      }}
    >
      <Collapse.Panel
        key={object.uuid}
        className={s.panel}
        header={
          <div className={s.header} id={`ref-${object.uuid}`}>
            <span className={s.type}>{theme[0]}</span>
            <span className={s.name}>{object.name}: </span>
            <span className={s.title}>{object.title}</span>
          </div>
        }
      >
        {notResult ? (
          <PropertiesTable object={object} references={references} />
        ) : (
          <div className={s.result}>
            <h5>参数</h5>
            <PropertiesTable object={object} references={references} />

            <h5>返回值</h5>
            <TypeRender type={object.result!}></TypeRender>
          </div>
        )}
      </Collapse.Panel>
    </Collapse>
  );
});

ObjectCard.displayName = 'ObjectCard';
