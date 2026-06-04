/**
 * 供应商授权签发查询对象
 */
export interface LicenseIssueQuery extends PageQuery {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 授权编号
   */
  licenseId?: string;

  /**
   * 客户主键
   */
  customerId?: string | number;

  /**
   * 密钥编号
   */
  keyId?: string;

  /**
   * 签名算法
   */
  algorithm?: string;

  /**
   * 协议版本
   */
  schemaVersion?: string;

  /**
   * 版本类型
   */
  edition?: string;

  /**
   * 功能编码集合
   */
  featureCodes?: string;

  /**
   * 安装标识
   */
  installId?: string;

  /**
   * 签发状态
   */
  issueStatus?: string;

  /**
   * 签发类型
   */
  issueType?: string;

  /**
   * 签发人
   */
  issuedBy?: string;

  /**
   * 扩展查询参数
   */
  params?: Record<string, any>;
}

/**
 * 供应商授权签发返回对象
 */
export interface LicenseIssueVO extends BaseEntity {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 授权编号
   */
  licenseId?: string;

  /**
   * 客户主键
   */
  customerId?: string | number;

  /**
   * 密钥编号
   */
  keyId?: string;

  /**
   * 签名算法
   */
  algorithm?: string;

  /**
   * 协议版本
   */
  schemaVersion?: string;

  /**
   * 版本类型
   */
  edition?: string;

  /**
   * 功能编码集合
   */
  featureCodes?: string;

  /**
   * 安装标识
   */
  installId?: string;

  /**
   * 生效时间
   */
  validFrom?: string;

  /**
   * 失效时间
   */
  validTo?: string;

  /**
   * 签发状态
   */
  issueStatus?: string;

  /**
   * 签发类型
   */
  issueType?: string;

  /**
   * 签发人
   */
  issuedBy?: string;

  /**
   * 签发时间
   */
  issuedTime?: string;

  /**
   * 吊销时间
   */
  revokedTime?: string;

  /**
   * 授权载荷
   */
  licensePayload?: string;

  /**
   * 签名内容
   */
  signatureText?: string;

  /**
   * 允许兼容后端后续扩展字段
   */
  [key: string]: any;
}
