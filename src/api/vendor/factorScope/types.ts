export interface FactorScopeQuery extends PageQuery {
  id?: string | number;
  versionId?: string | number;
  customerId?: string | number;
  edition?: string;
  licenseId?: string;
  scopeStatus?: string;
  params?: Record<string, any>;
}

export interface FactorScopeVO extends BaseEntity {
  id: string | number;
  versionId: string | number;
  customerId?: string | number;
  edition?: string;
  licenseId?: string;
  scopeStatus?: string;
  createTime?: string;
  [key: string]: any;
}
