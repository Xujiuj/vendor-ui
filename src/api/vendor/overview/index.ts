import request from '@/utils/request';
import type { ApiResponse } from '../shared';
import type { VendorOverviewVO } from './types';

const VENDOR_OVERVIEW_BASE_URL = '/vendor/overview';

export const getVendorOverview = (): Promise<ApiResponse<VendorOverviewVO>> => {
  return request({
    url: VENDOR_OVERVIEW_BASE_URL,
    method: 'get'
  });
};
