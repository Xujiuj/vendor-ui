import request from '@/utils/request';

export const dynamicTenant = (tenantId: string | number) => {
  return request({
    url: `/system/tenant/dynamic/${tenantId}`,
    method: 'get'
  });
};

export const dynamicClear = () => {
  return request({
    url: '/system/tenant/dynamic/clear',
    method: 'get'
  });
};
