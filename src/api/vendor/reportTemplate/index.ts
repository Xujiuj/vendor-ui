import request from '@/utils/request';
import { ReportTemplateForm, ReportTemplateQuery, ReportTemplateUploadVO, ReportTemplateVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

const REPORT_TEMPLATE_BASE_URL = '/vendor/report-template';

export const listReportTemplate = (query?: ReportTemplateQuery): Promise<ListResponse<ReportTemplateVO>> => {
  return request({
    url: `${REPORT_TEMPLATE_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

export const getReportTemplate = (id: string | number): Promise<ApiResponse<ReportTemplateVO>> => {
  return request({
    url: `${REPORT_TEMPLATE_BASE_URL}/${id}`,
    method: 'get'
  });
};

export const addReportTemplate = (data: ReportTemplateForm): Promise<ApiResponse> => {
  return request({
    url: REPORT_TEMPLATE_BASE_URL,
    method: 'post',
    data
  });
};

export const updateReportTemplate = (data: ReportTemplateForm): Promise<ApiResponse> => {
  return request({
    url: REPORT_TEMPLATE_BASE_URL,
    method: 'put',
    data
  });
};

export const deleteReportTemplate = (ids: string | number | Array<string | number>): Promise<ApiResponse> => {
  return request({
    url: `${REPORT_TEMPLATE_BASE_URL}/${ids}`,
    method: 'delete'
  });
};

export const uploadReportTemplateFile = (data: FormData): Promise<ApiResponse<ReportTemplateUploadVO>> => {
  return request({
    url: `${REPORT_TEMPLATE_BASE_URL}/upload`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const publishReportTemplate = (id: string | number): Promise<ApiResponse> => {
  return request({
    url: `${REPORT_TEMPLATE_BASE_URL}/${id}/publish`,
    method: 'post'
  });
};

export const disableReportTemplate = (id: string | number): Promise<ApiResponse> => {
  return request({
    url: `${REPORT_TEMPLATE_BASE_URL}/${id}/disable`,
    method: 'post'
  });
};
