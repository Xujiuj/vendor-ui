import request from '@/utils/request';
import { TemplateScopeForm, TemplateScopeQuery, TemplateScopeVO } from './types';
import type { ApiResponse, ListResponse } from '../shared';

const TEMPLATE_SCOPE_BASE_URL = '/vendor/report-template-scope';

export const listTemplateScope = (query?: TemplateScopeQuery): Promise<ListResponse<TemplateScopeVO>> => {
  return request({
    url: `${TEMPLATE_SCOPE_BASE_URL}/list`,
    method: 'get',
    params: query
  });
};

export const getTemplateScope = (id: string | number): Promise<ApiResponse<TemplateScopeVO>> => {
  return request({
    url: `${TEMPLATE_SCOPE_BASE_URL}/${id}`,
    method: 'get'
  });
};

export const addTemplateScope = (data: TemplateScopeForm): Promise<ApiResponse> => {
  return request({
    url: TEMPLATE_SCOPE_BASE_URL,
    method: 'post',
    data
  });
};

export const updateTemplateScope = (data: TemplateScopeForm): Promise<ApiResponse> => {
  return request({
    url: TEMPLATE_SCOPE_BASE_URL,
    method: 'put',
    data
  });
};

export const deleteTemplateScope = (ids: string | number | Array<string | number>): Promise<ApiResponse> => {
  return request({
    url: `${TEMPLATE_SCOPE_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
