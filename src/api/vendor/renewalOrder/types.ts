export interface RenewalOrderQuery extends PageQuery {
  id?: string | number;
  orderNo?: string;
  customerId?: string | number;
  licenseId?: string;
  orderStatus?: string;
  issueStatus?: string;
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
  issueStatus?: string;
  payChannel?: string;
  requestSource?: string;
  amount?: number | string;
  paidTime?: string;
  issuedLicenseId?: string;
  createTime?: string;
  updateTime?: string;
  [key: string]: any;
}

export interface RenewalOrderForm {
  id?: string | number;
  orderNo?: string;
  customerId?: string | number;
  licenseId?: string;
  installId?: string;
  requestedEdition?: string;
  renewalPeriod?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  idempotencyKey?: string;
  requestSource?: string;
  orderStatus?: string;
  payChannel?: string;
  amount?: number | string;
  paidTime?: string;
  issuedLicenseId?: string;
}

export interface RenewalCallbackForm {
  id?: string | number;
  orderNo?: string;
  orderStatus: string;
  payChannel?: string;
  paidTime?: string;
  issuedLicenseId?: string;
}

export interface ManualRenewalBindForm {
  id: string | number;
  orderNo?: string;
  orderStatus: string;
  issuedLicenseId: string;
}
