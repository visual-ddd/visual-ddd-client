import React from 'react';
import { concurrently, NoopArray } from '@wakeapp/utils';
import Router from 'next/router';
import { request } from '@/modules/backend-client';
import type { DomainSimple, DomainVersion } from '@/modules/team/types';
import type { BusinessDomainDSL } from '@/modules/domain/api/dsl/interface';
import type { IVersion } from '@/lib/components/VersionControl';

import type { IDomainServiceStore } from '../../scenario-design';
import { VersionBadge } from '@/lib/components/VersionBadge';

export type Item = IDomainServiceStore.Item;

type ID = Item['id'];

export class DomainServiceStore implements IDomainServiceStore {
  private domains?: Item[];

  private versions: Map<string, Item[]> = new Map();

  private services: Map<`${ID}_${ID}`, Item[]> = new Map();

  /**
   * 获取业务域列表
   * @returns
   */
  getDomains = concurrently(async (): Promise<Item[]> => {
    if (this.domains) {
      return this.domains;
    }

    const teamId = Router.query.id;

    const list = await request.requestByGet<DomainSimple[]>('/wd/visual/web/domain-design/domain-design-page-query', {
      teamId,
      pageNo: 1,
      pageSize: 1000,
    });

    return (this.domains = list.map(i => {
      return {
        id: i.id,
        name: i.name,
      };
    }));
  });

  /**
   * 获取业务域版本列表
   * @param domainId
   * @returns
   */
  getDomainVersionList = async (domainId: string): Promise<Item[]> => {
    const cache = this.versions.get(domainId);

    if (cache) {
      return cache;
    }

    const list = await request.requestByGet<IVersion[]>(
      '/wd/visual/web/domain-design-version/domain-design-version-page-query',
      {
        pageNo: 1,
        pageSize: 1000,
        searchCount: false,
        domainDesignId: domainId,
      }
    );

    const items = list.map(i => {
      return {
        id: i.id,
        name: React.createElement(VersionBadge, {
          version: i.currentVersion,
          status: i.state,
          type: 'text',
        }),
      };
    });

    this.versions.set(domainId, items);

    return items;
  };

  /**
   * 获取业务域服务列表
   *
   * @param domainId
   * @param versionId
   * @returns
   */
  getDomainServiceList = async (domainId: string, versionId: string): Promise<Item[]> => {
    const key = `${domainId}_${versionId}` as const;
    const cache = this.services.get(key);

    if (cache) {
      return cache;
    }

    const detail = await request.requestByGet<DomainVersion>(
      '/wd/visual/web/domain-design-version/domain-design-version-detail-query',
      {
        id: versionId,
      }
    );

    const dslStr = detail.domainDesignDsl;

    let list: Item[];

    if (dslStr) {
      try {
        const dsl = JSON.parse(dslStr) as BusinessDomainDSL;

        list = [];

        dsl.queryModel.queries.forEach(i => {
          list.push({ id: i.uuid, name: `查询-${i.name}${i.title ? `(${i.title})` : ''}` });
        });

        dsl.domainModel.aggregates.forEach(agg => {
          agg.commands.forEach(cmd => {
            list.push({ id: cmd.uuid, name: `命令-${cmd.name}${cmd.title ? `(${cmd.title})` : ''}` });
          });
        });
      } catch {
        list = NoopArray;
      }
    } else {
      list = NoopArray;
    }

    this.services.set(key, list);

    return list;
  };
}
