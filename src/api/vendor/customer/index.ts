import request from '@/utils/request';
import { CustomerQuery, CustomerVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

/**
 * 查询供应商客户列表
 * @param query
 */
export const listCustomer = (query?: CustomerQuery): Promise<ListResponse<CustomerVO>> => {
  return request({
    url: '/vendor/customer/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询供应商客户详情
 * @param id
 */
export const getCustomer = (id: string | number): Promise<ApiResponse<CustomerVO>> => {
  return request({
    url: '/vendor/customer/' + id,
    method: 'get'
  });
};
