import request from '@/utils/request';
import type { ApiResponse, ListResponse } from '../shared';
import type { DimensionRecordForm, DimensionRecordQuery, DimensionRecordVO } from './types';

const DIMENSION_RECORD_BASE_URL = '/vendor/dimension-record';

/**
 * Query vendor dimension record list.
 */
export const listDimensionRecord = (query?: DimensionRecordQuery): Promise<ListResponse<DimensionRecordVO>> => {
  return request({
    url: `${DIMENSION_RECORD_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

/**
 * Query vendor dimension record detail.
 */
export const getDimensionRecord = (id: string | number): Promise<ApiResponse<DimensionRecordVO>> => {
  return request({
    url: `${DIMENSION_RECORD_BASE_URL}/${id}`,
    method: 'get'
  });
};

/**
 * Add vendor dimension record.
 */
export const addDimensionRecord = (data: DimensionRecordForm): Promise<ApiResponse<void>> => {
  return request({
    url: DIMENSION_RECORD_BASE_URL,
    method: 'post',
    data
  });
};

/**
 * Update vendor dimension record.
 */
export const updateDimensionRecord = (data: DimensionRecordForm): Promise<ApiResponse<void>> => {
  return request({
    url: DIMENSION_RECORD_BASE_URL,
    method: 'put',
    data
  });
};

/**
 * Delete vendor dimension records.
 */
export const deleteDimensionRecord = (ids: string | number | Array<string | number>): Promise<ApiResponse<void>> => {
  return request({
    url: `${DIMENSION_RECORD_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
