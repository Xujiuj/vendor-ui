import request from '@/utils/request';
import type { ApiResponse, ListResponse } from '../shared';
import type { ReportContentForm, ReportContentQuery, ReportContentVO } from './types';

const REPORT_CONTENT_BASE_URL = '/vendor/report-content';

/**
 * Query vendor report content list.
 */
export const listReportContent = (query?: ReportContentQuery): Promise<ListResponse<ReportContentVO>> => {
  return request({
    url: `${REPORT_CONTENT_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

/**
 * Query vendor report content detail.
 */
export const getReportContent = (id: string | number): Promise<ApiResponse<ReportContentVO>> => {
  return request({
    url: `${REPORT_CONTENT_BASE_URL}/${id}`,
    method: 'get'
  });
};

/**
 * Add vendor report content.
 */
export const addReportContent = (data: ReportContentForm): Promise<ApiResponse<void>> => {
  return request({
    url: REPORT_CONTENT_BASE_URL,
    method: 'post',
    data
  });
};

/**
 * Update vendor report content.
 */
export const updateReportContent = (data: ReportContentForm): Promise<ApiResponse<void>> => {
  return request({
    url: REPORT_CONTENT_BASE_URL,
    method: 'put',
    data
  });
};

/**
 * Delete vendor report content rows.
 */
export const deleteReportContent = (ids: string | number | Array<string | number>): Promise<ApiResponse<void>> => {
  return request({
    url: `${REPORT_CONTENT_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
