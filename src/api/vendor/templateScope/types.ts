export interface TemplateScopeQuery extends PageQuery {
  id?: string | number;
  templateId?: string | number;
  customerId?: string | number;
  packageId?: string | number;
  packageName?: string;
  edition?: string;
  licenseId?: string;
  scopeStatus?: string;
  params?: Record<string, any>;
}

export interface TemplateScopeVO extends BaseEntity {
  id: string | number;
  templateId: string | number;
  customerId?: string | number;
  packageId?: string | number;
  packageName?: string;
  edition?: string;
  licenseId?: string;
  scopeStatus?: string;
  createTime?: string;
  [key: string]: any;
}

export interface TemplateScopeForm {
  id?: string | number;
  templateId?: string | number;
  customerId?: string | number;
  packageId?: string | number;
  packageName?: string;
  edition?: string;
  licenseId?: string;
  scopeStatus?: string;
}
