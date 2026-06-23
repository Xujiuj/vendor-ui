export interface VendorTableFieldQuery extends PageQuery {
  id?: string | number;
  tableGroup?: string;
  tableCode?: string;
  fieldKey?: string;
  fieldLabel?: string;
  fieldType?: string;
  status?: string;
  params?: Record<string, any>;
}

export interface VendorTableFieldForm {
  id?: string | number;
  tableGroup: string;
  tableCode: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  fieldPrecision?: number;
  fieldWidth?: number;
  requiredFlag?: boolean;
  sortOrder?: number;
  status?: string;
  remark?: string;
}

export interface VendorTableFieldVO extends BaseEntity {
  id: string | number;
  tableGroup: string;
  tableCode: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  fieldPrecision?: number;
  fieldWidth?: number;
  requiredFlag?: boolean;
  sortOrder?: number;
  status?: string;
  remark?: string;
  [key: string]: any;
}
