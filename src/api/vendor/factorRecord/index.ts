import request from '@/utils/request';
import type { ApiResponse, ListResponse } from '../shared';
import type { FactorRecordForm, FactorRecordQuery, FactorRecordVO } from './types';

const FACTOR_RECORD_BASE_URL = '/vendor/factor-record';

/**
 * Query vendor factor record list.
 */
export const listFactorRecord = (query?: FactorRecordQuery): Promise<ListResponse<FactorRecordVO>> => {
  return request({
    url: `${FACTOR_RECORD_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

/**
 * Query vendor factor record detail.
 */
export const getFactorRecord = (id: string | number): Promise<ApiResponse<FactorRecordVO>> => {
  return request({
    url: `${FACTOR_RECORD_BASE_URL}/${id}`,
    method: 'get'
  });
};

/**
 * Add vendor factor record.
 */
export const addFactorRecord = (data: FactorRecordForm): Promise<ApiResponse<void>> => {
  return request({
    url: FACTOR_RECORD_BASE_URL,
    method: 'post',
    data
  });
};

/**
 * Update vendor factor record.
 */
export const updateFactorRecord = (data: FactorRecordForm): Promise<ApiResponse<void>> => {
  return request({
    url: FACTOR_RECORD_BASE_URL,
    method: 'put',
    data
  });
};

/**
 * Delete vendor factor records.
 */
export const deleteFactorRecord = (ids: string | number | Array<string | number>): Promise<ApiResponse<void>> => {
  return request({
    url: `${FACTOR_RECORD_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
