import type { RouteRecordRaw } from 'vue-router';

type PortalRoute = RouteRecordRaw & {
  permissions?: string[];
  children?: PortalRoute[];
  component?: unknown;
  meta?: RouteRecordRaw['meta'] & {
    permissions?: string[];
    title?: unknown;
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

export const vendorAllowedPermissionPrefixes = ['vendor:', 'system:', 'monitor:', 'tool:gen'];

export const vendorForbiddenMenuTitlePatterns = [
  /^0?[1-5][\s.、_-]/,
  /配置排放源|确认排放因子|活动数据|绿电绿证|强度管理|强度分母/,
  /排放源识别|排放因子确认|企业本地|本地业务/,
  /扩展字段|自定义字段/,
  /数据(校验|验证|提交|催办)/,
  /(提交|催办).*(跟踪|记录|提醒|状态)/,
  /License\s*(导入|运行状态|状态|验签|验证|runtime|import|verify)/i,
  /(导入|验签|验证|运行状态|状态)\s*License/i,
  /License.*(淇|杩|鐘|楠|瀵|琛)/i,
  /Power\s*BI.*(本地|连接|connection)/i,
  /本地连接/i
];

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
    'submissionTracking',
    'submissionReminder',
    'powerBiLocal',
    'powerBiLocalConnection',
    'localConnection'
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
    'factor/confirm',
    'green/electricity',
    'intensity/denominator',
    'license/import',
    'license/runtime',
    'license/state',
    'license/verify',
    'powerbi/localconnection',
    'power-bi/local-connection',
    'powerbi/local-connection',
    'submission/reminder',
    'submission/tracking',
    'system/activityData/index',
    'system/customFieldMeta/index',
    'system/emissionSource/index',
    'system/factorConfirm/index',
    'system/greenElectricity/index',
    'system/intensity/index',
    'system/intensityDenominator/index',
    'system/licenseState/index',
    'enterprise/licenseImport/index'
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
      if (route.children && !hasChildren && isMenuContainer(route)) {
        return undefined;
      }

      return {
        ...route,
        ...(route.children ? (hasChildren ? { children } : { children: undefined }) : {})
      } as RouteRecordRaw;
    })
    .filter((route): route is RouteRecordRaw => Boolean(route));
}

export function isVendorForbiddenRoute(route: PortalRoute): boolean {
  const routePermissions = getRoutePermissions(route);
  return (
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
  return value.normalize('NFKC').replace(/\uFFFD/g, '').replace(/\s+/g, ' ').trim();
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
  return [
    ...(Array.isArray(route.permissions) ? route.permissions : []),
    ...(Array.isArray(route.meta?.permissions) ? route.meta.permissions : [])
  ];
}

function isMenuContainer(route: PortalRoute): boolean {
  const component = String(route.component ?? '').toLowerCase();
  return component === 'layout' || component === 'parentview';
}
