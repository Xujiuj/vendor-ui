import { parseTime } from '@/utils/ruoyi';

type ListResponse<T> = {
  rows?: T[];
  total?: number | string;
  data?: T[] | T;
};

export const readRows = <T>(response: unknown): T[] => {
  const res = response as ListResponse<T>;
  if (Array.isArray(res.rows)) {
    return res.rows;
  }
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return [];
};

export const readTotal = <T>(response: unknown, rows: T[]): number => {
  const res = response as ListResponse<T>;
  return Number(res.total ?? rows.length ?? 0);
};

export const formatDateTime = (value?: string): string => {
  if (!value) {
    return '-';
  }
  return parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') || value;
};

export const formatText = (value?: string | number | boolean): string => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '-';
  }
  if (typeof value === 'string' && /^-?\d+\.\d+$/.test(value.trim())) {
    return value.trim().replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  }
  return String(value);
};

export const formatPublishStatus = (status?: string): string => {
  const normalizedStatus = status?.toUpperCase();
  const statusMap: Record<string, string> = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    RELEASED: '已发布',
    FROZEN: '已冻结',
    RETIRED: '已退役',
    DISABLED: '已停用'
  };
  return normalizedStatus ? statusMap[normalizedStatus] || status || '-' : '-';
};

export const publishStatusTagType = (status?: string): 'success' | 'warning' | 'info' | 'danger' => {
  const normalizedStatus = status?.toUpperCase();
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    DRAFT: 'info',
    PUBLISHED: 'success',
    RELEASED: 'success',
    FROZEN: 'danger',
    RETIRED: 'warning',
    DISABLED: 'warning'
  };
  return normalizedStatus ? statusMap[normalizedStatus] || 'info' : 'info';
};

export const formatScopeStatus = (status?: string): string => {
  const statusMap: Record<string, string> = {
    ACTIVE: '开放中',
    ENABLED: '开放中',
    DISABLED: '已停用',
    EXPIRED: '已过期',
    PENDING: '待生效'
  };
  return status ? statusMap[status] || status : '-';
};

export const scopeStatusTagType = (status?: string): 'success' | 'warning' | 'info' | 'danger' => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    ACTIVE: 'success',
    ENABLED: 'success',
    DISABLED: 'warning',
    EXPIRED: 'danger',
    PENDING: 'info'
  };
  return status ? statusMap[status] || 'info' : 'info';
};
