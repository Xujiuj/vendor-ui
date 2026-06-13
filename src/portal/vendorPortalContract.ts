import type { RouteRecordRaw } from 'vue-router';

type PortalRoute = RouteRecordRaw & {
  permissions?: string[];
  children?: PortalRoute[];
  component?: unknown;
  meta?: RouteRecordRaw['meta'] & {
    permissions?: string[];
    title?: unknown;
    link?: unknown;
  };
};

export const vendorPrototypeColorTokens = {
  primary: '#1677ff',
  primaryDark: '#0f5fcb',
  success: '#18a058',
  ink: '#1f2937',
  text: '#4b5563',
  muted: '#8a94a6',
  line: '#e5e7eb',
  bg: '#f3f7f5',
  side: '#18342f',
  sideDeep: '#102820',
  sideActive: '#0e211d',
  brand: '#1f8f6a'
} as const;

export const vendorAllowedPermissionPrefixes = ['vendor:', 'system:'];

const vendorMenuTitleRules = [
  { title: '首页', keys: ['index', '/index', 'Index'] },
  { title: '厂商运营', keys: ['vendor'] },
  { title: '数据管理', keys: ['data-management', 'dataManagement'] },
  { title: '客户档案', keys: ['vendor:customer', 'vendor/customer', 'customer'] },
  { title: 'License 授权管理', keys: ['vendor:licenseIssue', 'vendor/license', 'license', 'system/license/index'] },
  { title: '因子版本', keys: ['vendor:factorVersion', 'factor-version', 'factorVersion', 'vendor/factorVersion/index'] },
  { title: '因子明细', keys: ['vendor:factorRecord', 'factor-record', 'factorRecord', 'vendor/factorRecord/index'] },
  { title: '因子开放范围', keys: ['vendor:factorScope', 'factor-scope', 'factorScope', 'vendor/factorScope/index'] },
  { title: '模板库', keys: ['vendor:reportTemplate', 'report-template', 'reportTemplate', 'vendor/reportTemplate/index'] },
  { title: '模板分发', keys: ['vendor:templateScope', 'template-scope', 'templateScope', 'vendor/templateScope/index'] },
  { title: '维表管理', keys: ['vendor:dimension', 'dimension', 'vendor/dimension/index'] },
  { title: '公告管理', keys: ['vendor:announcement', 'announcement', 'vendor/announcement/index'] },
  { title: '续费订单', keys: ['vendor:renewalOrder', 'renewal-order', 'renewalOrder', 'vendor/renewalOrder/index'] },
  { title: '系统管理', keys: ['system'] },
  { title: '用户管理', keys: ['system:user', 'system/user/index'] },
  { title: '公告配置', keys: ['system:notice', 'system/notice/index'] }
] as const;

const vendorSystemManagementRouteKeys = [
  'system:role',
  'system/role/index',
  'system:menu',
  'system/menu/index',
  'system:tenantPackage',
  'system/tenantPackage/index',
  'system:dept',
  'system/dept/index',
  'system:post',
  'system/post/index',
  'system:dict',
  'system/dict/index',
  'system:config',
  'system/config/index'
] as const;

export const vendorForbiddenMenuTitlePatterns = [
  /^0?[1-5][\s.、_-]/,
  /活动数据|绿电绿证|强度管理|强度分母|排放源|排放因子确认|企业本地|本地业务/,
  /扩展字段|自定义字段|数据(校验|验证|提交|催办)/,
  /(提交|催办).*(跟踪|记录|提醒|状态)/,
  /License\s*(导入|运行状态|状态|验签|验证|runtime|import|verify)/i,
  /(导入|验签|验证|运行状态)\s*License/i,
  /Power\s*BI.*(本地|连接|connection)/i,
  /本地连接/i,
  /PLUS官网|测试菜单|系统监控|系统工具|租户管理|工作流|流程|任务|RuoYi|若依/i,
  /^\?+$/
];

const vendorAllowedRouteKeys = new Set(
  [...vendorMenuTitleRules.flatMap((rule) => rule.keys), ...vendorSystemManagementRouteKeys].map(normalizeRouteKey)
);

const vendorForbiddenRouteKeys = new Set(
  [
    'activityData',
    'carbonAccounting',
    'carbonData',
    'carbonWorkflow',
    'customFieldMeta',
    'dataCommit',
    'dataEntry',
    'dataSubmission',
    'dataValidation',
    'demo',
    'emissionSource',
    'factorConfirm',
    'greenElectricity',
    'intensity',
    'intensityDenominator',
    'licenseImport',
    'licenseRuntime',
    'licenseState',
    'licenseVerify',
    'licenseVerification',
    'localConnection',
    'monitor',
    'myDocument',
    'online',
    'powerBiLocal',
    'powerBiLocalConnection',
    'processDefinition',
    'processInstance',
    'processMonitor',
    'snailjob',
    'submissionReminder',
    'submissionTracking',
    'task',
    'taskCopyList',
    'taskFinish',
    'taskWaiting',
    'tenant',
    'tool',
    'workflow'
  ].map(normalizeRouteKey)
);

const vendorForbiddenRoutePaths = new Set(
  [
    'activity/data',
    'carbon/data',
    'custom/field/meta',
    'data/commit',
    'data/entry',
    'data/submission',
    'data/validation',
    'emission/source',
    'enterprise/licenseImport/index',
    'factor/confirm',
    'green/electricity',
    'intensity/denominator',
    'license/import',
    'license/runtime',
    'license/state',
    'license/verify',
    'power-bi/local-connection',
    'powerbi/local-connection',
    'powerbi/localconnection',
    'submission/reminder',
    'submission/tracking',
    'system/activityData/index',
    'system/customFieldMeta/index',
    'system/emissionSource/index',
    'system/factorConfirm/index',
    'system/greenElectricity/index',
    'system/intensity/index',
    'system/intensityDenominator/index',
    'system/licenseState/index'
  ].map(normalizeRouteKey)
);

export function filterVendorPortalRoutes(routes: PortalRoute[]): RouteRecordRaw[] {
  return routes
    .map((route) => {
      const children = route.children ? filterVendorPortalRoutes(route.children) : undefined;
      const hasChildren = Boolean(children?.length);

      if (isVendorForbiddenRoute(route) && (!isMenuContainer(route) || !hasChildren)) {
        return undefined;
      }
      if (!isVendorAllowedRoute(route) && !hasChildren) {
        return undefined;
      }
      if (route.children && !hasChildren && isMenuContainer(route)) {
        return undefined;
      }

      return normalizeVendorPortalRoute({
        ...route,
        ...(route.children ? (hasChildren ? { children } : { children: undefined }) : {})
      } as PortalRoute);
    })
    .filter((route): route is RouteRecordRaw => Boolean(route));
}

export function isVendorAllowedRoute(route: PortalRoute): boolean {
  if (isExternalMenu(route)) {
    return false;
  }
  return getRouteIdentityValues(route)
    .map((value) => normalizeRouteKey(value))
    .some((value) => vendorAllowedRouteKeys.has(value));
}

export function isVendorForbiddenRoute(route: PortalRoute): boolean {
  if (isVendorAllowedRoute(route)) {
    return false;
  }
  const routePermissions = getRoutePermissions(route);
  return (
    isExternalMenu(route) ||
    hasVendorForbiddenRouteValue(route.path) ||
    hasVendorForbiddenRouteValue(route.name) ||
    hasVendorForbiddenRouteValue(route.component) ||
    hasVendorForbiddenPermission(routePermissions) ||
    isVendorForbiddenMenuTitle(route.meta?.title)
  );
}

export function isVendorForbiddenMenuTitle(title?: unknown): boolean {
  if (typeof title !== 'string') {
    return false;
  }
  const normalizedTitle = normalizeMenuText(title);
  return vendorForbiddenMenuTitlePatterns.some((pattern) => pattern.test(normalizedTitle));
}

export function normalizeMenuText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\uFFFD/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeVendorMenuTitle(route: PortalRoute): string | undefined {
  const values = getRouteIdentityValues(route).map((value) => normalizeRouteKey(value));
  const matchedRule = vendorMenuTitleRules.find((rule) => rule.keys.some((key) => values.includes(normalizeRouteKey(key))));
  return matchedRule?.title;
}

export function normalizeRouteKey(value: string): string {
  return value
    .replace(/\\/g, '/')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/^\/+|\/+$/g, '')
    .replace(/_/g, '-')
    .toLowerCase()
    .replace(/-/g, '');
}

function normalizeVendorPortalRoute(route: PortalRoute): RouteRecordRaw {
  const title = normalizeVendorMenuTitle(route);
  if (!title) {
    return route as RouteRecordRaw;
  }
  return {
    ...route,
    meta: {
      ...route.meta,
      title
    }
  } as RouteRecordRaw;
}

function getRouteIdentityValues(route: PortalRoute): string[] {
  return [
    route.path,
    route.name,
    route.component,
    route.meta?.title,
    ...getRoutePermissions(route).flatMap((permission) => [permission, permission.split(':').slice(0, 2).join(':')])
  ]
    .filter((value): value is string | number | symbol => Boolean(value))
    .map(String);
}

function hasVendorForbiddenRouteValue(value?: unknown): boolean {
  if (!value) {
    return false;
  }
  const normalizedValue = normalizeRouteKey(String(value));
  const pathSegments = normalizedValue.split('/').filter(Boolean);
  return (
    vendorForbiddenRoutePaths.has(normalizedValue) ||
    vendorForbiddenRouteKeys.has(normalizedValue) ||
    pathSegments.some((segment) => vendorForbiddenRouteKeys.has(segment))
  );
}

function hasVendorForbiddenPermission(permissions: string[]): boolean {
  return permissions.some((permission) => {
    const normalizedPermission = permission.toLowerCase();
    if (normalizedPermission.startsWith('enterprise:')) {
      return true;
    }
    if (!hasVendorAllowedPermissionPrefix(normalizedPermission)) {
      return true;
    }
    return normalizedPermission.split(':').some((part) => vendorForbiddenRouteKeys.has(normalizeRouteKey(part)));
  });
}

function hasVendorAllowedPermissionPrefix(permission: string): boolean {
  return vendorAllowedPermissionPrefixes.some((prefix) => permission.startsWith(prefix));
}

function getRoutePermissions(route: PortalRoute): string[] {
  return [...(Array.isArray(route.permissions) ? route.permissions : []), ...(Array.isArray(route.meta?.permissions) ? route.meta.permissions : [])];
}

function isMenuContainer(route: PortalRoute): boolean {
  const component = String(route.component ?? '').toLowerCase();
  return component === 'layout' || component === 'parentview';
}

function isExternalMenu(route: PortalRoute): boolean {
  const path = String(route.path ?? '');
  const link = String(route.meta?.link ?? '');
  return /^https?:\/\//i.test(path) || /^https?:\/\//i.test(link);
}
