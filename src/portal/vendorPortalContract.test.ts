import { describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePermissionStore } from '@/store/modules/permission';
import {
  filterVendorPortalRoutes,
  isVendorAllowedRoute,
  isVendorForbiddenMenuTitle,
  vendorAllowedPermissionPrefixes,
  vendorPrototypeColorTokens
} from './vendorPortalContract';

vi.mock('@/router', () => ({
  default: {
    addRoute: vi.fn()
  },
  constantRoutes: [],
  dynamicRoutes: []
}));

const titlesOf = (routes: any[]) => routes.map((route) => route.meta?.title);

describe('vendor dynamic router guard', () => {
  it('keeps only vendor portal menus and required system user menu', () => {
    const routes = [
      {
        path: '/vendor',
        component: 'Layout',
        meta: { title: '厂商运营', icon: 'guide' },
        children: [
          { path: 'customer', component: 'system/tenant/index', permissions: ['vendor:customer:list'], meta: { title: '客户档案' } },
          { path: 'license', component: 'vendor/licenseIssue/index', permissions: ['vendor:licenseIssue:list'], meta: { title: 'License 授权管理' } },
          { path: 'legacy-license', component: 'system/license/index', permissions: ['system:license:list'], meta: { title: 'License 授权管理' } },
          {
            path: 'renewal-order',
            component: 'vendor/renewalOrder/index',
            permissions: ['vendor:renewalOrder:list'],
            meta: { title: '续费订单' }
          },
          {
            path: 'license-import',
            component: 'enterprise/licenseImport/index',
            permissions: ['enterprise:license:import'],
            meta: { title: 'License 导入验签' }
          }
        ]
      },
      {
        path: '/data-management',
        component: 'Layout',
        meta: { title: '数据管理', icon: 'database' },
        children: [
          {
            path: 'factor-version',
            component: 'vendor/factorVersion/index',
            permissions: ['vendor:factorVersion:list'],
            meta: { title: '因子版本' }
          },
          {
            path: 'factor-record',
            component: 'vendor/factorRecord/index',
            permissions: ['vendor:factorRecord:list'],
            meta: { title: '因子明细' }
          },
          {
            path: 'factor-scope',
            component: 'vendor/factorScope/index',
            permissions: ['vendor:factorScope:list'],
            meta: { title: '因子开放范围' }
          },
          {
            path: 'report-template',
            component: 'vendor/reportTemplate/index',
            permissions: ['vendor:reportTemplate:list'],
            meta: { title: '模板库' }
          },
          {
            path: 'template-scope',
            component: 'vendor/templateScope/index',
            permissions: ['vendor:templateScope:list'],
            meta: { title: '模板分发' }
          },
          {
            path: 'dimension',
            component: 'vendor/dimension/index',
            permissions: ['vendor:dimension:list'],
            meta: { title: '维表管理' }
          },
          {
            path: 'announcement',
            component: 'vendor/announcement/index',
            permissions: ['vendor:announcement:list'],
            meta: { title: '公告管理' }
          }
        ]
      },
      {
        path: '/system',
        component: 'Layout',
        meta: { title: '系统管理', icon: 'system' },
        children: [
          { path: 'user', component: 'system/user/index', permissions: ['system:user:list'], meta: { title: '用户管理' } },
          { path: 'role', component: 'system/role/index', permissions: ['system:role:list'], meta: { title: '角色管理' } },
          {
            path: 'role-auth/user/:roleId',
            component: 'system/role/authUser',
            permissions: ['system:role:edit'],
            meta: { title: '分配用户', activeMenu: '/system/role' }
          },
          {
            path: 'user-auth/role/:userId',
            component: 'system/user/authRole',
            permissions: ['system:user:edit'],
            meta: { title: '分配角色', activeMenu: '/system/user' }
          },
          { path: 'menu', component: 'system/menu/index', permissions: ['system:menu:list'], meta: { title: '菜单管理' } },
          {
            path: 'tenantPackage',
            component: 'system/tenantPackage/index',
            permissions: ['system:tenantPackage:list'],
            meta: { title: '套餐管理' }
          },
          { path: 'dept', component: 'system/dept/index', permissions: ['system:dept:list'], meta: { title: '部门管理' } },
          { path: 'post', component: 'system/post/index', permissions: ['system:post:list'], meta: { title: '岗位管理' } },
          { path: 'dict', component: 'system/dict/index', permissions: ['system:dict:list'], meta: { title: '字典管理' } },
          { path: 'config', component: 'system/config/index', permissions: ['system:config:list'], meta: { title: '参数设置' } },
          { path: 'notice', component: 'system/notice/index', permissions: ['system:notice:list'], meta: { title: '公告配置' } }
        ]
      },
      {
        path: '/monitor',
        component: 'Layout',
        meta: { title: '日志管理', icon: 'log' },
        children: [
          { path: 'operlog', component: 'monitor/operlog/index', permissions: ['monitor:operlog:list'], meta: { title: '操作日志' } },
          { path: 'logininfor', component: 'monitor/logininfor/index', permissions: ['monitor:logininfor:list'], meta: { title: '登录日志' } }
        ]
      },
      { path: '/gen', component: 'tool/gen/index', permissions: ['tool:gen:list'], meta: { title: '代码生成' } },
      {
        path: '/tenant',
        component: 'Layout',
        meta: { title: '租户管理', icon: 'chart' },
        children: [{ path: 'tenant', component: 'system/tenant/index', meta: { title: '租户管理' } }]
      },
      {
        path: 'https://gitee.com/dromara/RuoYi-Vue-Plus',
        component: 'Layout',
        meta: { title: 'PLUS官网', icon: 'guide', link: 'https://gitee.com/dromara/RuoYi-Vue-Plus' }
      },
      {
        path: '/demo',
        component: 'Layout',
        meta: { title: '测试菜单', icon: 'star' },
        children: [{ path: 'demo', component: 'demo/demo/index', meta: { title: '测试单表' } }]
      },
      {
        path: '/workflow',
        component: 'Layout',
        meta: { title: '???', icon: 'workflow' },
        children: [{ path: 'category', component: 'workflow/category/index', meta: { title: '????' } }]
      },
      {
        path: '/task',
        component: 'Layout',
        meta: { title: '????', icon: 'my-task' },
        children: [{ path: 'taskWaiting', component: 'workflow/task/taskWaiting', meta: { title: '????' } }]
      }
    ];

    const filtered = filterVendorPortalRoutes(routes as any);
    const vendorMenu = filtered.find((route) => route.path === '/vendor') as any;
    const systemMenu = filtered.find((route) => route.path === '/system') as any;
    const monitorMenu = filtered.find((route) => route.path === '/monitor') as any;

    expect(titlesOf(filtered)).toEqual(['厂商运营', '数据管理', '系统管理', '日志管理']);
    expect(titlesOf(vendorMenu.children)).toEqual(['客户档案', 'License 授权管理', '续费订单']);
    expect(JSON.stringify(vendorMenu)).not.toContain('system/license/index');
    const dataMenu = filtered.find((route) => route.path === '/data-management') as any;
    expect(titlesOf(dataMenu.children)).toEqual(['因子版本', '因子明细', '因子开放范围', '模板库', '模板分发', '维表管理', '公告管理']);
    expect(titlesOf(systemMenu.children)).toEqual(['用户管理', '角色管理', '分配用户', '分配角色', '套餐管理', '部门管理', '岗位管理', '公告配置']);
    expect(titlesOf(systemMenu.children).length).toBeGreaterThan(0);
    expect(titlesOf(monitorMenu.children)).toEqual(['操作日志', '登录日志']);
    expect(JSON.stringify(filtered)).not.toContain('PLUS官网');
    expect(JSON.stringify(filtered)).not.toContain('测试菜单');
    expect(JSON.stringify(filtered)).not.toContain('租户管理');
    expect(JSON.stringify(filtered)).not.toContain('菜单管理');
    expect(JSON.stringify(filtered)).not.toContain('字典管理');
    expect(JSON.stringify(filtered)).not.toContain('参数设置');
    expect(JSON.stringify(filtered)).not.toContain('代码生成');
    expect(JSON.stringify(filtered)).not.toContain('????');
    expect(JSON.stringify(filtered)).not.toContain('workflow');
    expect(JSON.stringify(filtered)).not.toContain('taskWaiting');
  });

  it('recognizes vendor allowed routes from stable route identities', () => {
    expect(isVendorAllowedRoute({ path: '/vendor', component: 'Layout', meta: { title: '???' } } as any)).toBe(true);
    expect(isVendorAllowedRoute({ path: '/data-management', component: 'Layout', meta: { title: '数据管理' } } as any)).toBe(true);
    expect(isVendorAllowedRoute({ path: 'customer', component: 'system/tenant/index', permissions: ['vendor:customer:list'] } as any)).toBe(true);
    expect(isVendorAllowedRoute({ path: 'role', component: 'system/role/index', permissions: ['system:role:list'] } as any)).toBe(true);
    expect(
      isVendorAllowedRoute({ path: 'role-auth/user/:roleId', component: 'system/role/authUser', permissions: ['system:role:edit'] } as any)
    ).toBe(true);
    expect(
      isVendorAllowedRoute({ path: 'user-auth/role/:userId', component: 'system/user/authRole', permissions: ['system:user:edit'] } as any)
    ).toBe(true);
    expect(isVendorAllowedRoute({ path: 'menu', component: 'system/menu/index', permissions: ['system:menu:list'] } as any)).toBe(false);
    expect(isVendorAllowedRoute({ path: 'notice', component: 'system/notice/index', permissions: ['system:notice:list'] } as any)).toBe(true);
    expect(isVendorAllowedRoute({ path: '/monitor', component: 'Layout', meta: { title: '日志管理' } } as any)).toBe(true);
    expect(isVendorAllowedRoute({ path: 'operlog', component: 'monitor/operlog/index', permissions: ['monitor:operlog:list'] } as any)).toBe(true);
    expect(isVendorAllowedRoute({ path: 'logininfor', component: 'monitor/logininfor/index', permissions: ['monitor:logininfor:list'] } as any)).toBe(
      true
    );
    expect(isVendorAllowedRoute({ path: 'gen', component: 'tool/gen/index', permissions: ['tool:gen:list'] } as any)).toBe(false);
    expect(
      isVendorAllowedRoute({ path: 'tenantPackage', component: 'system/tenantPackage/index', permissions: ['system:tenantPackage:list'] } as any)
    ).toBe(true);
    expect(
      isVendorAllowedRoute({ path: 'factor-scope', component: 'vendor/factorScope/index', permissions: ['vendor:factorCustomerScope:add'] } as any)
    ).toBe(true);
    expect(
      isVendorAllowedRoute({ path: 'factor-scope', component: 'vendor/factorScope/index', permissions: ['vendor:factorCustomerScope:edit'] } as any)
    ).toBe(true);
    expect(
      isVendorAllowedRoute({ path: 'renewal-order', component: 'vendor/renewalOrder/index', permissions: ['vendor:renewalOrder:callback'] } as any)
    ).toBe(true);
    expect(
      isVendorAllowedRoute({ path: 'renewal-order', component: 'vendor/renewalOrder/index', permissions: ['vendor:renewalOrder:retryIssue'] } as any)
    ).toBe(true);
    expect(isVendorAllowedRoute({ path: '/tenant', component: 'Layout', meta: { title: '租户管理' } } as any)).toBe(false);
    expect(isVendorAllowedRoute({ path: '/workflow', component: 'Layout', meta: { title: '???' } } as any)).toBe(false);
  });

  it('keeps vendor menu order stable even when backend returns routes out of order', () => {
    const filtered = filterVendorPortalRoutes([
      { path: '/monitor', component: 'Layout', meta: { title: '日志管理' }, children: [{ path: 'operlog', component: 'monitor/operlog/index' }] },
      { path: '/system', component: 'Layout', meta: { title: '系统管理' }, children: [{ path: 'user', component: 'system/user/index' }] },
      {
        path: '/data-management',
        component: 'Layout',
        meta: { title: '数据管理' },
        children: [{ path: 'dimension', component: 'vendor/dimension/index' }]
      },
      { path: '/vendor', component: 'Layout', meta: { title: '厂商运营' }, children: [{ path: 'customer', component: 'system/tenant/index' }] },
      { path: '/index', component: 'Layout', meta: { title: '首页' } }
    ] as any);

    expect(titlesOf(filtered)).toEqual(['首页', '厂商运营', '数据管理', '系统管理', '日志管理']);
  });

  it('rejects unrelated routes that reuse system child path names outside RuoYi system pages', () => {
    const filtered = filterVendorPortalRoutes([
      {
        path: '/workflow',
        component: 'Layout',
        meta: { title: '???' },
        children: [
          { path: 'role', component: 'workflow/role/index', permissions: ['workflow:role:list'], meta: { title: '角色' } },
          { path: 'menu', component: 'workflow/menu/index', permissions: ['workflow:menu:list'], meta: { title: '菜单' } }
        ]
      }
    ] as any);

    expect(filtered).toEqual([]);
  });

  it('recognizes enterprise-only and non-vendor titles', () => {
    expect(isVendorForbiddenMenuTitle('03 活动数据')).toBe(true);
    expect(isVendorForbiddenMenuTitle('License导入验签')).toBe(true);
    expect(isVendorForbiddenMenuTitle('Power BI 本地连接')).toBe(true);
    expect(isVendorForbiddenMenuTitle('PLUS官网')).toBe(true);
    expect(isVendorForbiddenMenuTitle('测试菜单')).toBe(true);
    expect(isVendorForbiddenMenuTitle('???')).toBe(true);
    expect(isVendorForbiddenMenuTitle('License 授权管理')).toBe(false);
  });

  it('documents vendor portal prefixes and prototype tokens', () => {
    expect(vendorAllowedPermissionPrefixes).toEqual(['vendor:', 'system:']);
    expect(vendorPrototypeColorTokens.side).toBe('#18342f');
    expect(vendorPrototypeColorTokens.brand).toBe('#1f8f6a');
  });

  it('filters sidebar routes when layout interactions rewrite the sidebar store', () => {
    setActivePinia(createPinia());
    const permissionStore = usePermissionStore();

    permissionStore.setSidebarRouters([
      { path: '/vendor', component: 'Layout', meta: { title: '???' }, children: [{ path: 'customer', permissions: ['vendor:customer:list'] }] },
      {
        path: '/data-management',
        component: 'Layout',
        meta: { title: '数据管理' },
        children: [{ path: 'dimension', permissions: ['vendor:dimension:list'] }]
      },
      { path: 'https://gitee.com/dromara/RuoYi-Vue-Plus', component: 'Layout', meta: { title: 'PLUS官网' } },
      { path: '/demo', component: 'Layout', meta: { title: '测试菜单' } },
      { path: '/workflow', component: 'Layout', meta: { title: '???' }, children: [{ path: 'category', meta: { title: '????' } }] },
      { path: '/task', component: 'Layout', meta: { title: '????' }, children: [{ path: 'taskWaiting', meta: { title: '????' } }] }
    ] as any);

    const sidebarText = JSON.stringify(permissionStore.getSidebarRoutes());

    expect(sidebarText).toContain('客户档案');
    expect(sidebarText).toContain('数据管理');
    expect(sidebarText).toContain('维表管理');
    expect(sidebarText).not.toContain('PLUS官网');
    expect(sidebarText).not.toContain('测试菜单');
    expect(sidebarText).not.toContain('????');
    expect(sidebarText).not.toContain('workflow');
    expect(sidebarText).not.toContain('taskWaiting');
  });

  it('keeps vendor system children after dynamic route components are transformed', () => {
    const filtered = filterVendorPortalRoutes([
      {
        path: '/system',
        component: 'Layout',
        meta: { title: '系统管理', icon: 'system' },
        children: [
          { path: 'user', component: 'system/user/index', meta: { title: '用户管理' } },
          { path: 'role', component: 'system/role/index', meta: { title: '角色管理' } },
          { path: 'menu', component: 'system/menu/index', meta: { title: '菜单管理' } },
          { path: 'tenantPackage', component: 'system/tenantPackage/index', meta: { title: '套餐管理' } },
          { path: 'oss', component: 'system/oss/index', meta: { title: '文件管理' } }
        ]
      }
    ] as any);

    const transformed = filtered.map((route: any) => ({
      ...route,
      component: () => Promise.resolve({}),
      children: route.children?.map((child: any) => ({
        ...child,
        component: () => Promise.resolve({})
      }))
    }));

    const sidebar = filterVendorPortalRoutes(transformed as any);
    const systemMenu = sidebar.find((route) => route.path === '/system') as any;

    expect(titlesOf(systemMenu.children)).toEqual(['用户管理', '角色管理', '套餐管理']);
    expect(JSON.stringify(systemMenu)).not.toContain('文件管理');
  });
});
