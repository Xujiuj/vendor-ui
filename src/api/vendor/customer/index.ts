import request from '@/utils/request';
import { CustomerForm, CustomerQuery, CustomerVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

const CUSTOMER_BASE_URL = '/vendor/customer';

/**
 * 查询供应商客户列表
 * @param query
 */
export const listCustomer = (query?: CustomerQuery): Promise<ListResponse<CustomerVO>> => {
  return request({
    url: `${CUSTOMER_BASE_URL}/list`,
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
    url: `${CUSTOMER_BASE_URL}/${id}`,
    method: 'get'
  });
};

export const addCustomer = (data: CustomerForm): Promise<ApiResponse<void>> => {
  return request({
    url: CUSTOMER_BASE_URL,
    method: 'post',
    data
  });
};

export const updateCustomer = (data: CustomerForm): Promise<ApiResponse<void>> => {
  return request({
    url: CUSTOMER_BASE_URL,
    method: 'put',
    data
  });
};

export const deleteCustomer = (ids: string | number | Array<string | number>): Promise<ApiResponse<void>> => {
  return request({
    url: `${CUSTOMER_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
