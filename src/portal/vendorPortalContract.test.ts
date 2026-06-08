import { describe, expect, it } from 'vitest';
import {
  filterVendorPortalRoutes,
  isVendorForbiddenMenuTitle,
  vendorAllowedPermissionPrefixes,
  vendorPrototypeColorTokens
} from './vendorPortalContract';

const titlesOf = (routes: any[]) => routes.map((route) => route.meta?.title);

describe('vendor dynamic router guard', () => {
  it('keeps backend returned vendor menus and removes enterprise menus', () => {
    const routes = [
      {
        path: '/vendor',
        component: 'Layout',
        meta: { title: '厂商运营', icon: 'guide' },
        children: [
          { path: 'customer', component: 'system/tenant/index', permissions: ['vendor:customer:list'], meta: { title: '客户档案' } },
          { path: 'license', component: 'system/license/index', permissions: ['vendor:licenseIssue:list'], meta: { title: 'License 授权管理' } },
          { path: 'factor-version', component: 'vendor/factorVersion/index', permissions: ['vendor:factorVersion:list'], meta: { title: '因子版本' } },
          { path: 'factor-scope', component: 'vendor/factorScope/index', permissions: ['vendor:factorScope:list'], meta: { title: '因子开放范围' } },
          { path: 'report-template', component: 'vendor/reportTemplate/index', permissions: ['vendor:reportTemplate:list'], meta: { title: '模板库' } },
          { path: 'template-scope', component: 'vendor/templateScope/index', permissions: ['vendor:templateScope:list'], meta: { title: '模板分发' } },
          { path: 'renewal-order', component: 'vendor/renewalOrder/index', permissions: ['vendor:renewalOrder:list'], meta: { title: '续费订单' } },
          { path: 'activity-data', component: 'system/activityData/index', permissions: ['system:activityData:list'], meta: { title: '03 活动数据' } },
          { path: 'license-import', component: 'enterprise/licenseImport/index', permissions: ['enterprise:license:import'], meta: { title: 'License 导入验签' } },
          { path: 'power-bi-local', component: 'system/powerBi/localConnection/index', permissions: ['enterprise:powerBi:connection'], meta: { title: 'Power BI 本地连接' } }
        ]
      },
      {
        path: '/system',
        component: 'Layout',
        meta: { title: '系统管理', icon: 'system' },
        children: [
          { path: 'user', component: 'system/user/index', permissions: ['system:user:list'], meta: { title: '用户管理' } },
          { path: 'license-state', component: 'system/licenseState/index', permissions: ['system:licenseState:list'], meta: { title: 'License运行状态' } }
        ]
      }
    ];

    const filtered = filterVendorPortalRoutes(routes as any);
    const vendorMenu = filtered.find((route) => route.path === '/vendor') as any;
    const systemMenu = filtered.find((route) => route.path === '/system') as any;

    expect(titlesOf(vendorMenu.children)).toEqual(['客户档案', 'License 授权管理', '因子版本', '因子开放范围', '模板库', '模板分发', '续费订单']);
    expect(titlesOf(systemMenu.children)).toEqual(['用户管理']);
    expect(JSON.stringify(filtered)).not.toContain('03 活动数据');
    expect(JSON.stringify(filtered)).not.toContain('License 导入验签');
    expect(JSON.stringify(filtered)).not.toContain('Power BI 本地连接');
  });

  it('recognizes Chinese, English, and mojibake enterprise-only titles', () => {
    expect(isVendorForbiddenMenuTitle('03 活动数据')).toBe(true);
    expect(isVendorForbiddenMenuTitle('License导入验签')).toBe(true);
    expect(isVendorForbiddenMenuTitle('License杩愯?鐘舵?琛')).toBe(true);
    expect(isVendorForbiddenMenuTitle('Power BI 本地连接')).toBe(true);
    expect(isVendorForbiddenMenuTitle('License 授权管理')).toBe(false);
  });

  it('documents vendor portal prefixes and prototype tokens', () => {
    expect(vendorAllowedPermissionPrefixes).toEqual(['vendor:', 'system:', 'monitor:', 'tool:gen']);
    expect(vendorPrototypeColorTokens.side).toBe('#18342f');
    expect(vendorPrototypeColorTokens.brand).toBe('#1f8f6a');
  });
});
