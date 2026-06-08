export interface RenewalOrderQuery extends PageQuery {
  id?: string | number;
  orderNo?: string;
  customerId?: string | number;
  licenseId?: string;
  orderStatus?: string;
  payChannel?: string;
  issuedLicenseId?: string;
  params?: Record<string, any>;
}

export interface RenewalOrderVO extends BaseEntity {
  id: string | number;
  orderNo: string;
  customerId: string | number;
  licenseId?: string;
  orderStatus?: string;
  payChannel?: string;
  amount?: number | string;
  paidTime?: string;
  issuedLicenseId?: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}
