/**
 * Vendor report content query object.
 */
export interface ReportContentQuery extends PageQuery {
  directoryNo?: number;
  directoryName?: string;
  subdirectoryNo?: number;
  subdirectoryName?: string;
  status?: string;
}

/**
 * Vendor report content form object.
 */
export interface ReportContentForm {
  id?: string | number;
  directoryNo?: number;
  directoryName: string;
  subdirectoryNo?: number;
  subdirectoryName: string;
  chartNames: string;
  displayOrder?: number;
  status?: string;
  remark?: string;
}

/**
 * Vendor report content view object.
 */
export interface ReportContentVO extends BaseEntity {
  id: string | number;
  directoryNo?: number;
  directoryName?: string;
  subdirectoryNo?: number;
  subdirectoryName?: string;
  chartNames?: string;
  displayOrder?: number;
  status?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}
