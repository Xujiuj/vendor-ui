/**
 * 供应商因子版本查询对象
 */
export interface FactorVersionQuery extends PageQuery {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 版本编码
   */
  versionCode?: string;

  /**
   * 版本名称
   */
  versionName?: string;

  /**
   * 发布状态
   */
  publishStatus?: string;

  /**
   * 冻结标记
   */
  frozenFlag?: number | boolean;

  /**
   * 发布人
   */
  publishedBy?: string;

  /**
   * 扩展查询参数
   */
  params?: Record<string, any>;
}

/**
 * 供应商因子版本返回对象
 */
export interface FactorVersionVO extends BaseEntity {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 版本编码
   */
  versionCode: string;

  /**
   * 版本名称
   */
  versionName: string;

  /**
   * 发布状态
   */
  publishStatus: string;

  /**
   * 冻结标记
   */
  frozenFlag: number | boolean;

  /**
   * 发布人
   */
  publishedBy?: string;

  /**
   * 发布时间
   */
  publishedTime?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 允许兼容后端后续扩展字段
   */
  [key: string]: any;
}
