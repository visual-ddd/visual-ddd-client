import { VersionStatus } from '@/lib/core';

export { VersionStatus };

export interface IVersion {
  id: number;
  createTime: string;
  createBy: string;
  startVersion: string;
  currentVersion: string;
  description: string;
  state: VersionStatus;
}

export interface VersionCreatePayload {
  startVersionId: number;
  startVersion: string;
  currentVersion: string;
  description: string;
}
