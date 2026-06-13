import request from '@/utils/request';
import { RenewalOrderQuery, RenewalOrderVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

const RENEWAL_ORDER_BASE_URL = '/vendor/renewal-order';

export const listRenewalOrder = (query?: RenewalOrderQuery): Promise<ListResponse<RenewalOrderVO>> => {
  return request({
    url: `${RENEWAL_ORDER_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

export const getRenewalOrder = (id: string | number): Promise<ApiResponse<RenewalOrderVO>> => {
  return request({
    url: `${RENEWAL_ORDER_BASE_URL}/${id}`,
    method: 'get'
  });
};

export const deleteRenewalOrder = (ids: string | number | Array<string | number>): Promise<ApiResponse> => {
  return request({
    url: `${RENEWAL_ORDER_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
