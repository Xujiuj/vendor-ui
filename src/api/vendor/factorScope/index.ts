import request from '@/utils/request';
import { FactorScopeQuery, FactorScopeVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

const FACTOR_SCOPE_BASE_URL = '/vendor/factor-customer-scope';

export const listFactorScope = (query?: FactorScopeQuery): Promise<ListResponse<FactorScopeVO>> => {
  return request({
    url: `${FACTOR_SCOPE_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

export const getFactorScope = (id: string | number): Promise<ApiResponse<FactorScopeVO>> => {
  return request({
    url: `${FACTOR_SCOPE_BASE_URL}/${id}`,
    method: 'get'
  });
};

export const deleteFactorScope = (ids: string | number | Array<string | number>): Promise<ApiResponse> => {
  return request({
    url: `${FACTOR_SCOPE_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
