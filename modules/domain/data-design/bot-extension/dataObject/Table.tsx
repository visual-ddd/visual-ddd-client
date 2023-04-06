import cloneDeep from 'lodash/cloneDeep';
import { ITable, parseReference } from '../../ai-transformer';
import { DataObjectName } from '../../dsl/constants';
import {
  DataObjectPropertyDSL,
  DataObjectReference,
  DataObjectReferenceCardinality,
  DataObjectTypeName,
} from '../../dsl/dsl';
import { createDataObjectDSL, createDataObjectPropertyDSL, createDataObjectType } from '../../dsl/factory';
import { DataObject, DataObjectEditorModel, DataObjectStore } from '../../model';
import { TableStore } from './TableStore';

/**
 * 数据表操作抽象
 */
export class Table implements ITable {
  readonly name: string;
  private dataObject?: DataObject;
  private editorModel: DataObjectEditorModel;
  private dataObjectStore: DataObjectStore;
  private tableStore: TableStore;

  /**
   * 普通任务
   */
  private tasks: (() => void)[] = [];

  /**
   * 批量处理之后的任务，比如查找引用管理可以在这里阶段
   */
  private tasksAfterBatch: (() => void)[] = [];

  /**
   * 最后阶段执行的任务，比如重命名
   */
  private tasksOnTheEnd: (() => void)[] = [];

  constructor(inject: {
    name: string;
    dataObject?: DataObject;
    dataObjectStore: DataObjectStore;
    tableStore: TableStore;
    editorModel: DataObjectEditorModel;
  }) {
    this.name = inject.name;
    this.dataObject = inject.dataObject;
    this.dataObjectStore = inject.dataObjectStore;
    this.tableStore = inject.tableStore;
    this.editorModel = inject.editorModel;

    // 未创建
    if (!this.dataObject) {
      this.tasks.push(() => {
        const node = createDataObjectDSL();
        node.properties = [];
        node.name = this.name;

        this.editorModel.commandHandler.createNode({
          id: node.uuid,
          name: DataObjectName.DataObject,
          type: 'node',
          properties: node,
        });
        this.dataObject = this.dataObjectStore.getObjectById(node.uuid)!;
      });
    }
  }

  execTasks(): void {
    this.tasks.forEach(task => task());
  }

  execTasksAfterBatch(): void {
    this.tasksAfterBatch.forEach(task => task());
  }

  execTasksOnTheEnd(): void {
    this.tasksOnTheEnd.forEach(task => task());
  }

  getId(): string {
    return this.dataObject!.id;
  }

  setTitle(title: string): void {
    this.tasks.push(() => {
      this.editorModel.commandHandler.updateNodeProperty({
        node: this.dataObject!.node,
        path: 'title',
        value: title,
      });

      this.tableStore.addLog(`设置数据对象 ${this.name} 标题为 ${title}`);
    });
  }

  rename(newName: string): void {
    this.tasksOnTheEnd.push(() => {
      this.editorModel.commandHandler.updateNodeProperty({
        node: this.dataObject!.node,
        path: 'name',
        value: newName,
      });

      this.tableStore.addLog(`重命名数据对象 ${this.name} 为 ${newName}`);
    });
  }

  remove(): void {
    this.tasksOnTheEnd.unshift(() => {
      this.editorModel.commandHandler.removeNode({
        node: this.dataObject!.node,
      });

      this.tableStore.addLog(`删除数据对象 ${this.name}`);
    });
  }

  getFieldByName(name: string): DataObjectPropertyDSL {
    return this.dataObject!.dsl.properties.find(p => p.name === name)!;
  }

  addField(
    name: string,
    params: {
      title: string;
      type: DataObjectTypeName;
      reference?: `${string}.${string}` | undefined;
      referenceCardinality?: DataObjectReferenceCardinality | undefined;
      primaryKey?: boolean | undefined;
      notNull?: boolean | undefined;
    }
  ): void {
    this.tasks.push(() => {
      const { type, title, primaryKey, notNull, reference, referenceCardinality } = params;
      const property = createDataObjectPropertyDSL(type);
      property.title = title;
      property.name = name;

      if (primaryKey) {
        property.primaryKey = true;
      }

      if (notNull) {
        property.notNull = true;
      }

      // 引用类型
      if (type === DataObjectTypeName.Reference && reference) {
        const ref = property.type as DataObjectReference;
        ref.cardinality = referenceCardinality;

        // 引用关系处理, 需要等待所有对象创建完毕
        this.tasksAfterBatch.push(() => {
          const { table, field } = parseReference(reference);
          const refTable = this.tableStore.getTableByName(table);

          if (refTable == null) {
            this.tableStore.warning.push(`未找到表: ${table}`);
            return;
          }

          const cloneRef = { ...ref };
          cloneRef.target = refTable.getId();

          const refProperty = refTable.getFieldByName(field);

          if (refProperty == null) {
            this.tableStore.warning.push(`未找到字段: ${table}.${field}`);
          } else {
            cloneRef.targetProperty = refProperty.uuid;
          }

          // 更新
          const newIdx = this.dataObject!.dsl.properties.findIndex(p => p.uuid === property.uuid);
          if (newIdx !== -1) {
            this.editorModel.commandHandler.updateNodeProperty({
              node: this.dataObject!.node,
              path: `properties[${newIdx}]type`,
              value: cloneRef,
            });
          }
        });
      }

      // 插入
      const clone = this.dataObject!.dsl.properties.slice();
      clone.push(property);

      // 更新
      this.editorModel.commandHandler.updateNodeProperty({
        node: this.dataObject!.node,
        path: 'properties',
        value: clone,
      });

      this.tableStore.addLog(`新增字段 ${this.name}.${name}`);
    });
  }

  updateField(
    name: string,
    params: {
      title?: string | undefined;
      type?: DataObjectTypeName | undefined;
      reference?: `${string}.${string}` | undefined;
      referenceCardinality?: DataObjectReferenceCardinality | undefined;
      primaryKey?: boolean | undefined;
      notNull?: boolean | undefined;
    }
  ): void {
    this.tasks.push(() => {
      const propertyIndex = this.dataObject!.dsl.properties.findIndex(p => p.name === name);
      if (propertyIndex === -1) {
        this.tableStore.warning.push(`字段 ${this.name}.${name} 不存在`);
        return;
      }

      const property = cloneDeep(this.dataObject!.dsl.properties[propertyIndex]);
      const { title, type, reference, referenceCardinality, primaryKey, notNull } = params;

      if (title != null) {
        property.title = title;
      }

      if (primaryKey != null) {
        property.primaryKey = primaryKey;
      }

      if (notNull != null) {
        property.notNull = notNull;
      }

      if (type != null) {
        const newType = createDataObjectType(type);
        property.type = newType;
      }

      if (reference != null || referenceCardinality != null) {
        // 引用关系变动
        if (property.type.type !== DataObjectTypeName.Reference) {
          this.tableStore.warning.push(`字段 ${this.name}.${name} 不是引用类型，无法修改引用关系`);
        } else {
          if (referenceCardinality != null) {
            property.type.cardinality = referenceCardinality;
          }

          if (reference != null) {
            // 修改引用关系
            this.tasksAfterBatch.push(() => {
              const { table, field } = parseReference(reference);
              const refTable = this.tableStore.getTableByName(table);

              if (refTable == null) {
                this.tableStore.warning.push(`未找到表: ${table}`);
                return;
              }

              const cloneRef = { ...(property.type as DataObjectReference) };
              cloneRef.target = refTable.getId();

              const refProperty = refTable.getFieldByName(field);

              if (refProperty == null) {
                this.tableStore.warning.push(`未找到字段: ${table}.${field}`);
              } else {
                cloneRef.targetProperty = refProperty.uuid;
              }

              // 更新
              const newIdx = this.dataObject!.dsl.properties.findIndex(p => p.uuid === property.uuid);
              if (newIdx === -1) {
                this.editorModel.commandHandler.updateNodeProperty({
                  node: this.dataObject!.node,
                  path: `properties[${newIdx}]type`,
                  value: cloneRef,
                });
              }
            });
          }
        }
      }

      const clone = this.dataObject!.dsl.properties.slice();
      clone[propertyIndex] = property;

      // 更新
      this.editorModel.commandHandler.updateNodeProperty({
        node: this.dataObject!.node,
        path: 'properties',
        value: clone,
      });

      this.tableStore.addLog(`更新字段 ${this.name}.${name}`);
    });
  }

  removeField(name: string) {
    this.tasksOnTheEnd.unshift(() => {
      const propertyIndex = this.dataObject!.dsl.properties.findIndex(p => p.name === name);
      if (propertyIndex === -1) {
        return;
      }

      const clone = this.dataObject!.dsl.properties.slice();
      clone.splice(propertyIndex, 1);

      this.editorModel.commandHandler.updateNodeProperty({
        node: this.dataObject!.node,
        path: 'properties',
        value: clone,
      });

      this.tableStore.addLog(`删除字段 ${this.name}.${name}`);
    });
  }

  renameField(name: string, newName: string): void {
    this.tasksOnTheEnd.push(() => {
      const propertyIndex = this.dataObject!.dsl.properties.findIndex(p => p.name === name);
      if (propertyIndex === -1) {
        return;
      }

      const property = cloneDeep(this.dataObject!.dsl.properties[propertyIndex]);
      property.name = newName;
      const clone = this.dataObject!.dsl.properties.slice();
      clone[propertyIndex] = property;

      this.editorModel.commandHandler.updateNodeProperty({
        node: this.dataObject!.node,
        path: 'properties',
        value: clone,
      });

      this.tableStore.addLog(`重命名字段 ${this.name}.${name} 为 ${newName} `);
    });
  }
}
