import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FactorVersionQuery, FactorVersionVO } from './types';

/**
 * 查询供应商因子版本列表
 * @param query
 */
export const listFactorVersion = (query?: FactorVersionQuery): AxiosPromise<FactorVersionVO[]> => {
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
export const getFactorVersion = (id: string | number): AxiosPromise<FactorVersionVO> => {
  return request({
    url: '/vendor/factor-version/' + id,
    method: 'get'
  });
};
