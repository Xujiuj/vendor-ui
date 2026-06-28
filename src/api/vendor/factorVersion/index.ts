import request from '@/utils/request';
import { FactorVersionForm, FactorVersionQuery, FactorVersionVO } from './types';
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

export const addFactorVersion = (data: FactorVersionForm): Promise<ApiResponse<void>> => {
  return request({
    url: FACTOR_VERSION_BASE_URL,
    method: 'post',
    data
  });
};

export const updateFactorVersion = (data: FactorVersionForm): Promise<ApiResponse<void>> => {
  return request({
    url: FACTOR_VERSION_BASE_URL,
    method: 'put',
    data
  });
};

export const deleteFactorVersion = (ids: string | number | Array<string | number>): Promise<ApiResponse<void>> => {
  return request({
    url: `${FACTOR_VERSION_BASE_URL}/${ids}`,
    method: 'delete'
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

export const unfreezeFactorVersion = (id: string | number): Promise<ApiResponse> => {
  return request({
    url: `${FACTOR_VERSION_BASE_URL}/${id}/unfreeze`,
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
