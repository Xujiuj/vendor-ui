import request from '@/utils/request';
import type { VendorTableFieldForm, VendorTableFieldQuery, VendorTableFieldVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

const VENDOR_TABLE_FIELD_BASE_URL = '/vendor/table-field';

export const listVendorTableField = (query?: VendorTableFieldQuery): Promise<ListResponse<VendorTableFieldVO>> => {
  return request({
    url: `${VENDOR_TABLE_FIELD_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

export const getVendorTableField = (id: string | number): Promise<ApiResponse<VendorTableFieldVO>> => {
  return request({
    url: `${VENDOR_TABLE_FIELD_BASE_URL}/${id}`,
    method: 'get'
  });
};

export const addVendorTableField = (data: VendorTableFieldForm): Promise<ApiResponse<void>> => {
  return request({
    url: VENDOR_TABLE_FIELD_BASE_URL,
    method: 'post',
    data
  });
};

export const updateVendorTableField = (data: VendorTableFieldForm): Promise<ApiResponse<void>> => {
  return request({
    url: VENDOR_TABLE_FIELD_BASE_URL,
    method: 'put',
    data
  });
};

export const deleteVendorTableField = (ids: string | number | Array<string | number>): Promise<ApiResponse<void>> => {
  return request({
    url: `${VENDOR_TABLE_FIELD_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
