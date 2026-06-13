export interface ReportTemplateQuery extends PageQuery {
  id?: string | number;
  templateCode?: string;
  templateName?: string;
  templateVersion?: string;
  publishStatus?: string;
  params?: Record<string, any>;
}

export interface ReportTemplateForm {
  id?: string | number;
  templateCode: string;
  templateName: string;
  templateVersion: string;
  fileName: string;
  fileUri: string;
  publishStatus?: string;
  remark?: string;
}

export interface ReportTemplateVO extends BaseEntity {
  id: string | number;
  templateCode: string;
  templateName: string;
  templateVersion: string;
  fileName: string;
  fileUri: string;
  publishStatus?: string;
  publishedBy?: string;
  publishedTime?: string;
  createTime?: string;
  remark?: string;
  [key: string]: any;
}

export interface ReportTemplateUploadVO {
  fileName: string;
  fileUri: string;
  size: number;
}
