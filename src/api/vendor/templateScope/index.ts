import request from '@/utils/request';
import { TemplateScopeQuery, TemplateScopeVO } from './types';
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

export const deleteTemplateScope = (ids: string | number | Array<string | number>): Promise<ApiResponse> => {
  return request({
    url: `${TEMPLATE_SCOPE_BASE_URL}/${ids}`,
    method: 'delete'
  });
};
