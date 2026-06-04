import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LicenseIssueQuery, LicenseIssueVO } from './types';

/**
 * 查询供应商授权签发列表
 * @param query
 */
export const listLicenseIssue = (query?: LicenseIssueQuery): AxiosPromise<LicenseIssueVO[]> => {
  return request({
    url: '/vendor/license-issue/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询供应商授权签发详情
 * @param id
 */
export const getLicenseIssue = (id: string | number): AxiosPromise<LicenseIssueVO> => {
  return request({
    url: '/vendor/license-issue/' + id,
    method: 'get'
  });
};
