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
  fieldOptions?: string;
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
  fieldOptions?: string;
  requiredFlag?: boolean;
  sortOrder?: number;
  status?: string;
  remark?: string;
  physicalTableName?: string;
  columnName?: string;
  columnType?: string;
  dataType?: string;
  columnComment?: string;
  nullable?: boolean;
  generatedColumn?: boolean;
  [key: string]: any;
}
