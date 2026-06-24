/**
 * 供应商客户查询对象
 */
export interface CustomerQuery extends PageQuery {
  /**
   * 客户主键
   */
  id?: string | number;

  /**
   * 客户编码
   */
  customerCode?: string;

  /**
   * 客户名称
   */
  customerName?: string;

  /**
   * 联系人
   */
  contactName?: string;

  /**
   * 客户状态
   */
  customerStatus?: string;

  /**
   * 扩展查询参数
   */
  params?: Record<string, any>;
}

/**
 * 供应商客户返回对象
 */
export interface CustomerVO extends BaseEntity {
  /**
   * 客户主键
   */
  id: string | number;

  /**
   * 客户编码
   */
  customerCode: string;

  /**
   * 客户名称
   */
  customerName: string;

  /**
   * 联系人
   */
  contactName?: string;

  /**
   * 联系邮箱
   */
  contactEmail?: string;

  /**
   * 联系电话
   */
  contactPhone?: string;

  /**
   * 客户状态
   */
  customerStatus: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 允许兼容后端后续扩展字段
   */
  [key: string]: any;
}

export interface CustomerForm {
  id?: string | number;
  customerCode?: string;
  customerName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  customerStatus?: string;
  remark?: string;
}
