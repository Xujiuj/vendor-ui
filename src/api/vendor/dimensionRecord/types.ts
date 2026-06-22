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
  field07?: string;
  field08?: string;
  field09?: string;
  field10?: string;
  field11?: string;
  field12?: string;
  field13?: string;
  field14?: string;
  field15?: string;
  field16?: string;
  field17?: string;
  field18?: string;
  field19?: string;
  field20?: string;
  field21?: string;
  field22?: string;
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
  field07?: string;
  field08?: string;
  field09?: string;
  field10?: string;
  field11?: string;
  field12?: string;
  field13?: string;
  field14?: string;
  field15?: string;
  field16?: string;
  field17?: string;
  field18?: string;
  field19?: string;
  field20?: string;
  field21?: string;
  field22?: string;
  sortOrder?: number;
  status?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}
