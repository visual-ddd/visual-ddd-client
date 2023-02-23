import { IDomainServiceStore } from '../../scenario-design';

export class DomainServiceStore implements IDomainServiceStore {
  async getDomains(): Promise<{ id: string; name: string }[]> {
    return [];
  }

  async getDomainVersionList(domainId: string): Promise<{ id: string; name: string }[]> {
    return [];
  }

  async getDomainServiceList(domainId: string, versionId: string): Promise<{ id: string; name: string }[]> {
    return [];
  }
}
