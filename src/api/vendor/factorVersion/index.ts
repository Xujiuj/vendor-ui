import request from '@/utils/request';
import { FactorVersionQuery, FactorVersionVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

/**
 * 查询供应商因子版本列表
 * @param query
 */
export const listFactorVersion = (query?: FactorVersionQuery): Promise<ListResponse<FactorVersionVO>> => {
  return request({
    url: '/vendor/factor-version/list',
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
    url: '/vendor/factor-version/' + id,
    method: 'get'
  });
};
