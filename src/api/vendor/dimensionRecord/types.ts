/**
 * Vendor dimension record query object.
 */
export interface DimensionRecordQuery extends PageQuery {
  id?: string | number;
  dimensionCode?: string;
  recordCode?: string;
  recordName?: string;
  parentCode?: string;
  status?: string;
  params?: Record<string, any>;
}

/**
 * Vendor dimension record form object.
 */
export interface DimensionRecordForm {
  id?: string | number;
  dimensionCode: string;
  recordCode: string;
  recordName: string;
  parentCode?: string;
  field01?: string;
  field02?: string;
  field03?: string;
  field04?: string;
  field05?: string;
  field06?: string;
  sortOrder?: number;
  status?: string;
  remark?: string;
}

/**
 * Vendor dimension record view object.
 */
export interface DimensionRecordVO extends BaseEntity {
  id: string | number;
  dimensionCode: string;
  recordCode: string;
  recordName: string;
  parentCode?: string;
  field01?: string;
  field02?: string;
  field03?: string;
  field04?: string;
  field05?: string;
  field06?: string;
  sortOrder?: number;
  status?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}
