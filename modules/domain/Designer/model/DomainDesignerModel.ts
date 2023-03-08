import { makeAutoBindThis } from '@/lib/store';
import { makeObservable, observable } from 'mobx';
import { tryDispose } from '@/lib/utils';
import { extraRestErrorMessage } from '@/modules/backend-client';
import { BaseDesignerModel, BaseDesignerAwarenessState } from '@/lib/designer';
import { BaseEditorAwarenessState, BaseNode } from '@/lib/editor';
import { message } from 'antd';

import { YJS_FIELD_NAME } from '../../constants';
import { DomainEditorModel, createDomainEditorModel } from '../../domain-design';
import { DomainObjectName } from '../../domain-design/dsl/constants';
import { DataObjectName } from '../../data-design/dsl/constants';
import { MapperObjectName } from '../../mapper-design/dsl/constants';
import type { EntityDSL } from '../../domain-design/dsl/dsl';
import { createQueryEditorModel } from '../../query-design';
import { createDataObjectEditorModel, DataObjectEditorModel } from '../../data-design';
import { UbiquitousLanguageModel } from '../../ubiquitous-language-design';
import { createMapperEditorModel, MapperEditorModel } from '../../mapper-design';

import { DomainDesignerTabs } from './constants';
import { ObjectStore } from './ObjectStore';
import { IDomainGeneratorHandler, domainObjectGenerate } from '../../generator';
import { DomainDesignerEvent } from './DomainDesignerEvent';

export interface DomainDesignerAwarenessState extends BaseDesignerAwarenessState {
  [YJS_FIELD_NAME.DOMAIN]: BaseEditorAwarenessState;
  [YJS_FIELD_NAME.QUERY]: BaseEditorAwarenessState;
  [YJS_FIELD_NAME.DATA_OBJECT]: BaseEditorAwarenessState;
  [YJS_FIELD_NAME.MAPPER]: BaseEditorAwarenessState;
}

/**
 * 业务域设计器模型
 */
export class DomainDesignerModel
  extends BaseDesignerModel<DomainDesignerTabs, DomainDesignerAwarenessState>
  implements IDomainGeneratorHandler
{
  /**
   * 设计器事件
   */
  event = new DomainDesignerEvent();

  @observable
  activeTab: DomainDesignerTabs = DomainDesignerTabs.Vision;

  objectStore: ObjectStore;

  /**
   * 统一语言模型
   */
  ubiquitousLanguageModel: UbiquitousLanguageModel;

  /**
   * 领域模型编辑器模型
   */
  domainEditorModel: DomainEditorModel;

  /**
   * 查询模型设计器
   */
  queryEditorModel: DomainEditorModel;

  /**
   * 数据对象编辑器
   */
  dataObjectEditorModel: DataObjectEditorModel;

  /**
   * 对象映射编辑器
   */
  mapperObjectEditorModel: MapperEditorModel;

  constructor(options: { id: string; readonly?: boolean }) {
    super({ ...options, name: 'domain' });

    const readonly = this.readonly;
    const doc = this.ydoc;

    const domainDatabase = doc.getMap(YJS_FIELD_NAME.DOMAIN);
    const queryDatabase = doc.getMap(YJS_FIELD_NAME.QUERY);
    const dataObjectDatabase = doc.getMap(YJS_FIELD_NAME.DATA_OBJECT);
    const mapperDatabase = doc.getMap(YJS_FIELD_NAME.MAPPER);
    const ubiquitousLanguageDatabase = doc.getArray<any>(YJS_FIELD_NAME.UBIQUITOUS_LANGUAGE);

    this.domainEditorModel = createDomainEditorModel({
      datasource: domainDatabase,
      doc: this.ydoc,
      readonly,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.DOMAIN),
      domainGenerator: this,
    });
    this.queryEditorModel = createQueryEditorModel({
      datasource: queryDatabase,
      doc: this.ydoc,
      readonly,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.DOMAIN),
    });
    this.dataObjectEditorModel = createDataObjectEditorModel({
      datasource: dataObjectDatabase,
      doc: this.ydoc,
      readonly,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.DATA_OBJECT),
    });
    const objectStore = (this.objectStore = new ObjectStore({
      domainDesignerModel: this,
      domainEditorModel: this.domainEditorModel,
      queryEditorModel: this.queryEditorModel,
      dataObjectEditorModel: this.dataObjectEditorModel,
    }));
    this.mapperObjectEditorModel = createMapperEditorModel({
      datasource: mapperDatabase,
      doc: this.ydoc,
      readonly,
      objectStore,
      awarenessRegistry: this.createAwarenessDelegate(YJS_FIELD_NAME.MAPPER),
    });
    this.ubiquitousLanguageModel = new UbiquitousLanguageModel({
      doc: this.ydoc,
      datasource: ubiquitousLanguageDatabase,
      readonly,
    });

    this.tabs = [
      {
        key: DomainDesignerTabs.DomainModel,
        model: this.domainEditorModel,
      },
      {
        key: DomainDesignerTabs.QueryModel,
        model: this.queryEditorModel,
      },
      {
        key: DomainDesignerTabs.DataModel,
        model: this.dataObjectEditorModel,
      },
      {
        key: DomainDesignerTabs.Mapper,
        model: this.mapperObjectEditorModel,
      },
    ];

    makeAutoBindThis(this);
    makeObservable(this);
  }

  /**
   * 销毁
   */
  override dispose() {
    super.dispose();

    tryDispose(this.ubiquitousLanguageModel);
    tryDispose(this.domainEditorModel);
    tryDispose(this.queryEditorModel);
    tryDispose(this.dataObjectEditorModel);
    tryDispose(this.mapperObjectEditorModel);
  }

  async domainGenerate(root: EntityDSL) {
    // 需要领域模型验证通过
    try {
      await this.domainEditorModel.validate();
    } catch (err) {
      message.error(`请修复验证错误后重试`);
      return false;
    }

    const loadingDestroy = message.loading('正在生成对象...', 0);

    try {
      const { query, dtos, dataObject, mapper } = domainObjectGenerate({
        aggregationRoot: root,
        domainObjectStore: this.objectStore,
      });

      // 查询模型注入
      const queryNode = this.queryEditorModel.commandHandler.createNode({
        id: query.uuid,
        name: DomainObjectName.Query,
        type: 'node',
        properties: {
          ...query,
          size: this.guestSize(query.properties.length),
        },
      });

      const dtoNodes: BaseNode[] = [];
      for (const dto of dtos) {
        dtoNodes.push(
          this.queryEditorModel.commandHandler.createNode({
            id: dto.uuid,
            name: DomainObjectName.DTO,
            type: 'node',
            properties: {
              ...dto,
              size: this.guestSize(dto.properties.length),
            },
          })
        );
      }

      // 数据模型注入
      const dataObjectNode = this.dataObjectEditorModel.commandHandler.createNode({
        id: dataObject.uuid,
        name: DataObjectName.DataObject,
        type: 'node',
        properties: {
          ...dataObject,
          size: this.guestSize(dataObject.properties.length),
        },
      });

      // 映射对象注入
      const mapperNode = this.mapperObjectEditorModel.commandHandler.createNode({
        id: mapper.uuid,
        name: MapperObjectName.MapperObject,
        type: 'node',
        properties: {
          ...mapper,
          size: this.guestSize(mapper.mappers.length),
        },
      });

      // 等待节点插入
      // 因为画布位于不同的 Tab，当Tab 未激活时，画布不会渲染，导致节点无法定位和计算大小, 从而导致节点无法计算布局,
      // 另外，我们的 React 自定义节点都采用 AutoResize 自动计算大小, 也会导致无法可靠地获取到节点的大小
      // 解决办法：
      // - Tab item 加上 forceRender, 在隐藏时强制渲染 Dom，这样可以获取到已有节点的数据
      // - 预估节点大小，见上文
      await message.info('正在生成查询模型...', 0.8);

      // 过了 0.8 秒后，已经错过了 undoManager 的合并时间，需要手动合并
      // 这意味着无法进行一键撤销, 因此，这里显式要求这些编辑器对接下来的变更进行合并
      this.queryEditorModel.mergeUndoCapturing();
      this.dataObjectEditorModel.mergeUndoCapturing();
      this.mapperObjectEditorModel.mergeUndoCapturing();

      this.queryEditorModel.event.emit('CMD_RE_LAYOUT');
      this.dataObjectEditorModel.event.emit('CMD_RE_LAYOUT');
      this.mapperObjectEditorModel.event.emit('CMD_RE_LAYOUT');

      await message.info('正在生成数据模型...', 0.5);
      await message.info('正在生成对象映射...', 0.5);

      const revoke = () => {
        this.queryEditorModel.commandHandler.removeNode({ node: queryNode });
        this.queryEditorModel.commandHandler.removeBatched({ nodes: dtoNodes });
        this.dataObjectEditorModel.commandHandler.removeNode({ node: dataObjectNode });
        this.mapperObjectEditorModel.commandHandler.removeNode({ node: mapperNode });
      };

      this.event.emit('DOMAIN_OBJECT_AUTO_GENERATED', { revoke });
    } catch (err) {
      message.error(`自动生成生成失败：${(err as Error).message}`);
    } finally {
      loadingDestroy();
    }
  }

  protected async loadData(params: { id: string }): Promise<ArrayBuffer> {
    const { id } = params;
    // 数据加载
    const response = await fetch(`/api/rest/domain/${id}`, { method: 'GET' });

    if (!response.ok) {
      const message = await extraRestErrorMessage(response);
      throw new Error(message || '数据加载失败');
    }

    return await response.arrayBuffer();
  }

  protected async saveData(params: { id: string; data: Uint8Array; isDiff: boolean }): Promise<void> {
    const { id, data, isDiff } = params;
    const response = await fetch(`/api/rest/domain/${id}?diff=${!!isDiff}`, { method: 'PUT', body: data });

    if (!response.ok) {
      const message = await extraRestErrorMessage(response);
      throw new Error(message || '保存失败');
    }
  }

  protected async loadVector(params: { id: string }): Promise<ArrayBuffer | undefined> {
    const res = await fetch(`/api/rest/domain/${this.id}/vector`, { method: 'GET' });
    if (res.ok) {
      return await res.arrayBuffer();
    }
  }

  private guestSize(propertiesLength: number) {
    return {
      width: 250,
      height: 120 + propertiesLength * 30,
    };
  }
}
