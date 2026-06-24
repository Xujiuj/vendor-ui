import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

export interface DimensionDataQuery {
  dimensionCode: string;
  recordCode?: string;
  recordName?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface DimensionDataRecord {
  id: number;
  dimensionCode: string;
  recordCode: string;
  recordName: string;
  parentCode?: string;
  sortOrder: number;
  status: string;
  createTime: string;
  updateTime: string;
  remark?: string;
  [key: string]: any;
}

export function listDimensionData(query: DimensionDataQuery): AxiosPromise<{ rows: DimensionDataRecord[]; total: number }> {
  return request({
    url: '/vendor/dimension-data/list',
    method: 'get',
    params: query
  });
}

export function getDimensionData(dimensionCode: string, id: number): AxiosPromise<DimensionDataRecord> {
  return request({
    url: `/vendor/dimension-data/${id}`,
    method: 'get',
    params: { dimensionCode }
  });
}

export function addDimensionData(dimensionCode: string, data: Record<string, any>): AxiosPromise<void> {
  return request({
    url: '/vendor/dimension-data',
    method: 'post',
    params: { dimensionCode },
    data
  });
}

export function updateDimensionData(dimensionCode: string, data: Record<string, any>): AxiosPromise<void> {
  return request({
    url: '/vendor/dimension-data',
    method: 'put',
    params: { dimensionCode },
    data
  });
}

export function deleteDimensionData(dimensionCode: string, ids: string): AxiosPromise<void> {
  return request({
    url: `/vendor/dimension-data/${ids}`,
    method: 'delete',
    params: { dimensionCode }
  });
}
