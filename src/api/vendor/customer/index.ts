import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CustomerQuery, CustomerVO } from './types';

/**
 * 查询供应商客户列表
 * @param query
 */
export const listCustomer = (query?: CustomerQuery): AxiosPromise<CustomerVO[]> => {
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
export const getCustomer = (id: string | number): AxiosPromise<CustomerVO> => {
  return request({
    url: '/vendor/customer/' + id,
    method: 'get'
  });
};
