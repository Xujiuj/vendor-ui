/**
 * Vendor factor record query object.
 */
export interface FactorRecordQuery extends PageQuery {
  id?: string | number;
  versionId?: string | number;
  factorCode?: string;
  factorName?: string;
  factorCategory?: string;
  enabledFlag?: boolean;
  params?: Record<string, any>;
}

/**
 * Vendor factor record form object.
 */
export interface FactorRecordForm {
  id?: string | number;
  versionId?: string | number;
  factorCode: string;
  factorName: string;
  factorCategory: string;
  factorValue?: number | string;
  factorUnit: string;
  sourceRef?: string;
  enabledFlag?: boolean;
}

/**
 * Vendor factor record view object.
 */
export interface FactorRecordVO extends BaseEntity {
  id: string | number;
  versionId: string | number;
  factorCode: string;
  factorName: string;
  factorCategory: string;
  factorValue: number | string;
  factorUnit: string;
  sourceRef?: string;
  enabledFlag?: boolean;
  createTime?: string;
  [key: string]: any;
}
