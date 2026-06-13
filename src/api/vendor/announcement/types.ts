/**
 * Vendor announcement query object.
 */
export interface AnnouncementQuery extends PageQuery {
  noticeTitle?: string;
  createByName?: string;
  status?: string;
  noticeType?: string;
  params?: Record<string, any>;
}

/**
 * Vendor announcement form object.
 */
export interface AnnouncementForm {
  noticeId?: string | number;
  noticeTitle: string;
  noticeType: string;
  noticeContent?: string;
  status: string;
  remark?: string;
  createByName?: string;
}

/**
 * Vendor announcement view object.
 */
export interface AnnouncementVO extends BaseEntity {
  noticeId: string | number;
  noticeTitle: string;
  noticeType: string;
  noticeContent?: string;
  status: string;
  remark?: string;
  createByName?: string;
  createTime?: string;
  [key: string]: any;
}
