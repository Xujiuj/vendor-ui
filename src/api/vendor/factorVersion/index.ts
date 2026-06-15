import request from '@/utils/request';
import { FactorVersionQuery, FactorVersionVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

const FACTOR_VERSION_BASE_URL = '/vendor/factor-version';

/**
 * 查询供应商因子版本列表
 * @param query
 */
export const listFactorVersion = (query?: FactorVersionQuery): Promise<ListResponse<FactorVersionVO>> => {
  return request({
    url: `${FACTOR_VERSION_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

/**
 * 查询供应商因子版本详情
 * @param id
 */
export const getFactorVersion = (id: string | number): Promise<ApiResponse<FactorVersionVO>> => {
  return request({
    url: `${FACTOR_VERSION_BASE_URL}/${id}`,
    method: 'get'
  });
};

export const publishFactorVersion = (id: string | number): Promise<ApiResponse> => {
  return request({
    url: `${FACTOR_VERSION_BASE_URL}/${id}/publish`,
    method: 'post'
  });
};

export const freezeFactorVersion = (id: string | number): Promise<ApiResponse> => {
  return request({
    url: `${FACTOR_VERSION_BASE_URL}/${id}/freeze`,
    method: 'post'
  });
};

export const retireFactorVersion = (id: string | number): Promise<ApiResponse> => {
  return request({
    url: `${FACTOR_VERSION_BASE_URL}/${id}/retire`,
    method: 'post'
  });
};

export const restoreFactorVersion = (id: string | number): Promise<ApiResponse> => {
  return request({
    url: `${FACTOR_VERSION_BASE_URL}/${id}/restore`,
    method: 'post'
  });
};
