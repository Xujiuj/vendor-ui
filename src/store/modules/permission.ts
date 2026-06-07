import { defineStore } from 'pinia';
import router, { constantRoutes, dynamicRoutes } from '@/router';
import store from '@/store';
import { getRouters } from '@/api/menu';
import auth from '@/plugins/auth';
import { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';
import ParentView from '@/components/ParentView/index.vue';
import InnerLink from '@/layout/components/InnerLink/index.vue';
import { ref } from 'vue';
import { createCustomNameComponent } from '@/utils/createCustomNameComponent';

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue');
const enterpriseOwnedRouteKeys = new Set([
  'activitydata',
  'carbonaccounting',
  'carbondata',
  'carbonworkflow',
  'customfieldmeta',
  'datacommit',
  'dataentry',
  'datasubmission',
  'datavalidation',
  'emissionsource',
  'factorconfirm',
  'greenelectricity',
  'intensity',
  'intensitydenominator',
  'licensestate',
  'licenseimport',
  'licenseruntime',
  'submissiontracking',
  'submissionreminder',
  'powerbi',
  'power-bi'
]);

const enterpriseOwnedRoutePaths = new Set([
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
  'powerbi/connection',
  'powerbi/localconnection',
  'power-bi/connection',
  'power-bi/local-connection',
  'submission/reminder',
  'submission/tracking'
]);

const enterpriseOwnedTitlePatterns = [
  /^0?[1-5][\s.、_-]/,
  /license\s*(导入|运行|状态|runtime|import)/i,
  /(导入|运行|状态|runtime|import)\s*license/i,
  /活动数据/,
  /排放源识别/,
  /排放因子确认/,
  /绿电绿证/,
  /强度管理/,
  /强度分母/,
  /自定义字段/,
  /数据(校验|验证|提交|催办)/,
  /(提交|催办).*(跟踪|记录|提醒|状态)/,
  /power\s*bi.*(连接|本地|runtime|connection)/i
];

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const addRoutes = ref<RouteRecordRaw[]>([]);
  const defaultRoutes = ref<RouteRecordRaw[]>([]);
  const topbarRouters = ref<RouteRecordRaw[]>([]);
  const sidebarRouters = ref<RouteRecordRaw[]>([]);

  const getRoutes = (): RouteRecordRaw[] => {
    return routes.value as RouteRecordRaw[];
  };
  const getDefaultRoutes = (): RouteRecordRaw[] => {
    return defaultRoutes.value as RouteRecordRaw[];
  };
  const getSidebarRoutes = (): RouteRecordRaw[] => {
    return sidebarRouters.value as RouteRecordRaw[];
  };
  const getTopbarRoutes = (): RouteRecordRaw[] => {
    return topbarRouters.value as RouteRecordRaw[];
  };

  const setRoutes = (newRoutes: RouteRecordRaw[]): void => {
    addRoutes.value = newRoutes;
    routes.value = constantRoutes.concat(newRoutes);
  };
  const setDefaultRoutes = (routes: RouteRecordRaw[]): void => {
    defaultRoutes.value = constantRoutes.concat(routes);
  };
  const setTopbarRoutes = (routes: RouteRecordRaw[]): void => {
    topbarRouters.value = routes;
  };
  const setSidebarRouters = (routes: RouteRecordRaw[]): void => {
    sidebarRouters.value = routes;
  };
  const generateRoutes = async (): Promise<RouteRecordRaw[]> => {
    const res = await getRouters();
    const { data } = res;
    const vendorMenuData = filterVendorMenuRoutes(data);
    const sdata = JSON.parse(JSON.stringify(vendorMenuData));
    const rdata = JSON.parse(JSON.stringify(vendorMenuData));
    const defaultData = JSON.parse(JSON.stringify(vendorMenuData));
    const sidebarRoutes = filterAsyncRouter(sdata);
    const rewriteRoutes = filterAsyncRouter(rdata, undefined, true);
    const defaultRoutes = filterAsyncRouter(defaultData);
    const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
    asyncRoutes.forEach((route) => {
      router.addRoute(route);
    });
    setRoutes(rewriteRoutes);
    setSidebarRouters(constantRoutes.concat(sidebarRoutes));
    setDefaultRoutes(sidebarRoutes);
    setTopbarRoutes(defaultRoutes);
    // 路由name重复检查
    duplicateRouteChecker(asyncRoutes, sidebarRoutes);
    return new Promise<RouteRecordRaw[]>((resolve) => resolve(rewriteRoutes));
  };

  const filterVendorMenuRoutes = (routes: RouteRecordRaw[]): RouteRecordRaw[] => {
    return routes
      .map((route) => {
        const children = route.children ? filterVendorMenuRoutes(route.children) : undefined;
        if (isEnterpriseOwnedRoute(route) && (!isMenuContainer(route) || !children?.length)) {
          return undefined;
        }
        if (route.children && !children?.length && isMenuContainer(route)) {
          return undefined;
        }
        return {
          ...route,
          ...(children ? { children } : {})
        };
      })
      .filter((route): route is RouteRecordRaw => Boolean(route));
  };

  const isMenuContainer = (route: RouteRecordRaw): boolean => {
    const component = String(route.component ?? '').toLowerCase();
    return component === 'layout' || component === 'parentview';
  };

  const isEnterpriseOwnedRoute = (route: RouteRecordRaw): boolean => {
    const routePermissions = (route as { permissions?: string[] }).permissions || ((route.meta || {}) as { permissions?: string[] }).permissions;
    return (
      hasEnterpriseOwnedRouteValue(route.path) ||
      hasEnterpriseOwnedRouteValue(route.name) ||
      hasEnterpriseOwnedRouteValue(route.component) ||
      hasEnterpriseOwnedPermission(routePermissions) ||
      hasEnterpriseOwnedTitle(route.meta?.title)
    );
  };

  const hasEnterpriseOwnedRouteValue = (value?: unknown): boolean => {
    if (!value) {
      return false;
    }
    const normalizedValue = normalizeRouteKey(String(value));
    const pathSegments = normalizedValue.split('/').filter(Boolean);
    return (
      enterpriseOwnedRoutePaths.has(normalizedValue) ||
      enterpriseOwnedRouteKeys.has(normalizedValue) ||
      pathSegments.some((segment) => enterpriseOwnedRouteKeys.has(segment))
    );
  };

  const hasEnterpriseOwnedPermission = (permissions?: string[]): boolean => {
    return Boolean(
      permissions?.some((permission) =>
        permission
          .toLowerCase()
          .split(':')
          .some((part) => enterpriseOwnedRouteKeys.has(normalizeRouteKey(part)))
      )
    );
  };

  const hasEnterpriseOwnedTitle = (title?: unknown): boolean => {
    return typeof title === 'string' && enterpriseOwnedTitlePatterns.some((pattern) => pattern.test(title));
  };

  const normalizeRouteKey = (value: string): string => {
    return value
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/^\/+|\/+$/g, '')
      .replace(/_/g, '-')
      .toLowerCase()
      .replace(/-/g, '');
  };

  /**
   * 遍历后台传来的路由字符串，转换为组件对象
   * @param asyncRouterMap 后台传来的路由字符串
   * @param lastRouter 上一级路由
   * @param type 是否是重写路由
   */
  const filterAsyncRouter = (asyncRouterMap: RouteRecordRaw[], lastRouter?: RouteRecordRaw, type = false): RouteRecordRaw[] => {
    return asyncRouterMap.filter((route) => {
      if (type && route.children) {
        route.children = filterChildren(route.children, undefined);
      }
      // Layout ParentView 组件特殊处理
      if (route.component?.toString() === 'Layout') {
        route.component = Layout;
      } else if (route.component?.toString() === 'ParentView') {
        route.component = ParentView;
      } else if (route.component?.toString() === 'InnerLink') {
        route.component = InnerLink;
      } else {
        route.component = loadView(route.component, route.name as string);
      }
      if (route.children != null && route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, route, type);
      } else {
        delete route.children;
        delete route.redirect;
      }
      return true;
    });
  };
  const filterChildren = (childrenMap: RouteRecordRaw[], lastRouter?: RouteRecordRaw): RouteRecordRaw[] => {
    let children: RouteRecordRaw[] = [];
    childrenMap.forEach((el) => {
      el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path;
      if (el.children && el.children.length && el.component?.toString() === 'ParentView') {
        children = children.concat(filterChildren(el.children, el));
      } else {
        children.push(el);
      }
    });
    return children;
  };
  return {
    routes,
    topbarRouters,
    sidebarRouters,
    defaultRoutes,

    getRoutes,
    getDefaultRoutes,
    getSidebarRoutes,
    getTopbarRoutes,

    setRoutes,
    generateRoutes,
    setSidebarRouters
  };
});

// 动态路由遍历，验证是否具备权限
export const filterDynamicRoutes = (routes: RouteRecordRaw[]) => {
  const res: RouteRecordRaw[] = [];
  routes.forEach((route) => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route);
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route);
      }
    }
  });
  return res;
};

export const loadView = (view: any, name: string) => {
  let res;
  for (const path in modules) {
    const viewsIndex = path.indexOf('/views/');
    let dir = path.substring(viewsIndex + 7);
    dir = dir.substring(0, dir.lastIndexOf('.vue'));
    if (dir === view) {
      res = createCustomNameComponent(modules[path], { name });
      return res;
    }
  }
  return res;
};

// 非setup
export const usePermissionStoreHook = () => {
  return usePermissionStore(store);
};

interface Route {
  name?: string | symbol;
  path: string;
  children?: Route[];
}

/**
 * 检查路由name是否重复
 * @param localRoutes 本地路由
 * @param routes 动态路由
 */
function duplicateRouteChecker(localRoutes: Route[], routes: Route[]) {
  // 展平
  function flatRoutes(routes: Route[]) {
    const res: Route[] = [];
    routes.forEach((route) => {
      if (route.children) {
        res.push(...flatRoutes(route.children));
      } else {
        res.push(route);
      }
    });
    return res;
  }

  const allRoutes = flatRoutes([...localRoutes, ...routes]);

  const nameList: string[] = [];
  allRoutes.forEach((route) => {
    const name = route.name.toString();
    if (name && nameList.includes(name)) {
      const message = `路由名称: [${name}] 重复, 会造成 404`;
      console.error(message);
      ElNotification({
        title: '路由名称重复',
        message,
        type: 'error'
      });
      return;
    }
    nameList.push(route.name.toString());
  });
}
