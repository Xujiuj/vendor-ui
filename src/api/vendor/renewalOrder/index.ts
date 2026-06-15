import request from '@/utils/request';
import { ManualRenewalBindForm, RenewalCallbackForm, RenewalOrderForm, RenewalOrderQuery, RenewalOrderVO } from './types';
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

export const addRenewalOrder = (data: RenewalOrderForm): Promise<ApiResponse> => {
  return request({
    url: RENEWAL_ORDER_BASE_URL,
    method: 'post',
    data
  });
};

export const updateRenewalOrder = (data: RenewalOrderForm): Promise<ApiResponse> => {
  return request({
    url: RENEWAL_ORDER_BASE_URL,
    method: 'put',
    data
  });
};

export const applyRenewalCallback = (data: RenewalCallbackForm): Promise<ApiResponse<RenewalOrderVO>> => {
  return request({
    url: `${RENEWAL_ORDER_BASE_URL}/callback`,
    method: 'post',
    data
  });
};

export const bindManualRenewalIssue = (data: ManualRenewalBindForm): Promise<ApiResponse<RenewalOrderVO>> => {
  return applyRenewalCallback({
    id: data.id,
    orderNo: data.orderNo,
    orderStatus: data.orderStatus,
    payChannel: 'manual',
    issuedLicenseId: data.issuedLicenseId
  });
};

export const retryRenewalIssue = (id: string | number): Promise<ApiResponse<RenewalOrderVO>> => {
  return request({
    url: `${RENEWAL_ORDER_BASE_URL}/${id}/retry-issue`,
    method: 'post'
  });
};

export const deleteRenewalOrder = (ids: string | number | Array<string | number>): Promise<ApiResponse> => {
  return request({
    url: `${RENEWAL_ORDER_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
