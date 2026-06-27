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

export type DimensionCode =
  | 'admin-division'
  | 'emission-source-category'
  | 'base-year'
  | 'ef-electricity-factor'
  | 'ef-electricity-version'
  | 'ef-electricity-scope'
  | 'greenhouse-gas';

export interface DimensionDataRecord {
  id: number;
  dimensionCode: DimensionCode | string;
  recordCode: string;
  recordName: string | number;
  parentCode?: string;
  sortOrder: number;
  status: string;
  createTime: string;
  updateTime: string;
  remark?: string;

  divisionCode?: string;
  divisionName?: string;
  levelType?: string;

  categoryCode?: string;
  businessKey?: string;
  categoryName?: string;
  categoryNameEn?: string;
  ghgScope?: string;
  ghgScopeCategory?: string;
  isoCategory?: string;
  isoCategoryEn?: string;
  isoCategoryDescription?: string;
  gbScopeCategory?: string;
  gbSubcategory?: string;
  effectiveDate?: string;
  expireDate?: string;
  currentFlag?: 'Y' | 'N' | string;
  versionNo?: string;
  standardCategory?: string;

  baseYearKey?: string;
  baseYear?: number;
  isCurrent?: boolean | number;
  description?: string;

  factorVersion?: string;
  effectiveYear?: number;
  regionName?: string;
  provinceFactor?: number;
  regionFactor?: number;
  nationalFactor?: number;
  nonFossilExcludedFactor?: number;
  nationalFossilPowerFactor?: number;

  scopeKey?: string;
  scopeName?: string;

  gasCode?: string;
  gasName?: string;
  gasNameEn?: string;
  gwpValue?: number;
  gwpVersion?: string;
  chemicalFormula?: string;

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
